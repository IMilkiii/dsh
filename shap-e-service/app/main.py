import uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse

try:
    from .generator import generate_combined, generate_from_image, generate_from_text
except ImportError:  # pragma: no cover - allows running without package install
    from generator import (  # type: ignore
        generate_combined,
        generate_from_image,
        generate_from_text,
    )

app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
PREVIEWS_DIR = BASE_DIR / "previews"
UPLOADS_DIR = BASE_DIR / "uploads"


@app.get("/")
def read_root():
    return {"message": "SHAP-E Service is running"}


@app.post("/generate")
async def generate_model(
    image: Optional[UploadFile] = File(None),
    prompt: Optional[str] = Form(None),
    generation_type: str = Form("image"),
    generate_preview: bool = Form(False),
):
    try:
        # Create output directories if they don't exist
        for directory in (MODELS_DIR, PREVIEWS_DIR, UPLOADS_DIR):
            directory.mkdir(parents=True, exist_ok=True)

        # Generate unique ID and target paths
        model_id = str(uuid.uuid4())
        model_path = MODELS_DIR / f"{model_id}.ply"
        preview_path = (
            PREVIEWS_DIR / f"{model_id}.png" if generate_preview else None
        )

        # Save uploaded image if provided
        saved_image_path: Optional[Path] = None
        if image:
            saved_image_path = UPLOADS_DIR / f"{model_id}_{image.filename}"
            with open(saved_image_path, "wb") as f:
                f.write(await image.read())

        # Dispatch generation based on requested mode
        if generation_type == "text":
            if not prompt:
                raise ValueError("Prompt is required for text generation.")
            generate_from_text(prompt, model_path, preview_path)
        elif generation_type == "image":
            if not saved_image_path:
                raise ValueError("Image is required for image generation.")
            generate_from_image(
                str(saved_image_path),
                model_path,
                preview_path,
                prompt=prompt,
            )
        else:  # "both" or any other value defaults to combined
            if not saved_image_path:
                raise ValueError("Image is required for combined generation.")
            generate_combined(
                str(saved_image_path),
                prompt,
                model_path,
                preview_path,
            )

        return JSONResponse(
            {
                "status": "completed",
                "model_path": str(model_path),
                "preview_path": (
                    str(preview_path) if preview_path else None
                ),
            }
        )
    except Exception as e:
        import traceback

        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/status/{task_id}")
def get_status(task_id: str):
    return {"status": "completed", "task_id": task_id}
