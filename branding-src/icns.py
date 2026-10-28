"""PNG'lerden gerçek bir .icns (ic07..ic10 PNG kayıtları) oluşturur."""
import struct, sys
out, src = sys.argv[1], sys.argv[2]
chunks = b""
for typ, size in ((b"ic07", 128), (b"ic08", 256), (b"ic09", 512), (b"ic10", 1024)):
    data = open(f"{src}/logo{size}.png", "rb").read()
    chunks += typ + struct.pack(">I", len(data) + 8) + data
open(out, "wb").write(b"icns" + struct.pack(">I", len(chunks) + 8) + chunks)
