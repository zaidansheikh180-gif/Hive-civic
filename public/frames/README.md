# HIVE Scroll Sequence Frames

Place the exported WebP/JPG sequence in this directory and list the filenames in `manifest.json` in chronological order.

Recommended production setup from the project scroll-animation specification:

- 2–4 second source animation.
- Extract at 30 fps.
- Prefer WebP for the final frame sequence.
- Keep filenames ordered numerically.
- Desktop loads every frame.
- Mobile automatically loads every second frame.

Example:

```json
{
  "frames": [
    "frame-0001.webp",
    "frame-0002.webp",
    "frame-0003.webp"
  ]
}
```
