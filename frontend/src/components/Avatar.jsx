import { C, initials } from "../theme";

export default function Avatar({ name, size = 36, bg = C.accentBg, color = C.accentText }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.33,
        fontWeight: 600,
        color,
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
}
