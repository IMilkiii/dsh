from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Optional, Tuple

import numpy as np
import torch
from PIL import Image
from shap_e.diffusion.gaussian_diffusion import diffusion_from_config
from shap_e.diffusion.sample import sample_latents
from shap_e.models.download import load_config, load_model
from shap_e.util.image_util import load_image
from shap_e.util.notebooks import decode_latent_image, decode_latent_mesh

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


@lru_cache(maxsize=1)
def _get_diffusion():
    return diffusion_from_config(load_config("diffusion"))


@lru_cache(maxsize=1)
def _get_transmitter():
    return load_model("transmitter", device=device)


@lru_cache(maxsize=1)
def _get_image_model():
    return load_model("image300M", device=device)


@lru_cache(maxsize=1)
def _get_text_model():
    return load_model("text300M", device=device)


def _save_outputs(latent, model_path: Path, preview_path: Optional[Path]):
    mesh = decode_latent_mesh(_get_transmitter(), latent).tri_mesh()
    mesh.write_ply(str(model_path))

    if preview_path:
        preview_array = decode_latent_image(
            _get_transmitter(),
            latent,
            render_mode="stf",
            size=256,
        )
        preview_image = Image.fromarray(preview_array.astype(np.uint8))
        preview_image.save(preview_path)


def generate_from_image(
    image_path: str,
    model_path: Path,
    preview_path: Optional[Path] = None,
    prompt: Optional[str] = None,
) -> Tuple[Path, Optional[Path]]:
    """Generate 3D model from a reference image using SHAP-E."""
    image = load_image(image_path)

    model_kwargs = {"images": [image]}
    if prompt:
        # Some conditioning models support auxiliary text guidance
        model_kwargs["texts"] = [prompt]

    latents = sample_latents(
        batch_size=1,
        model=_get_image_model(),
        diffusion=_get_diffusion(),
        guidance_scale=3.0,
        model_kwargs=model_kwargs,
        progress=False,
        device=device,
        clip_denoised=False,
        use_fp16=torch.cuda.is_available(),
    )

    _save_outputs(latents[0], model_path, preview_path)
    return model_path, preview_path


def generate_from_text(
    prompt: str,
    model_path: Path,
    preview_path: Optional[Path] = None,
) -> Tuple[Path, Optional[Path]]:
    """Generate 3D model from a text prompt using SHAP-E."""
    if not prompt:
        raise ValueError("Prompt is required for text generation.")

    latents = sample_latents(
        batch_size=1,
        model=_get_text_model(),
        diffusion=_get_diffusion(),
        guidance_scale=15.0,
        model_kwargs=dict(texts=[prompt]),
        progress=False,
        device=device,
        clip_denoised=False,
        use_fp16=torch.cuda.is_available(),
    )

    _save_outputs(latents[0], model_path, preview_path)
    return model_path, preview_path


def generate_combined(
    image_path: str,
    prompt: Optional[str],
    model_path: Path,
    preview_path: Optional[Path] = None,
) -> Tuple[Path, Optional[Path]]:
    """
    Generate 3D model using both image and text guidance.

    Currently this leverages the image-conditioned model with optional text guidance.
    """
    return generate_from_image(
        image_path=image_path,
        model_path=model_path,
        preview_path=preview_path,
        prompt=prompt,
    )
