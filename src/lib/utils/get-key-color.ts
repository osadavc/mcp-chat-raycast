import { Color } from "@raycast/api";

export const getColorForKey = (key: string): Color => {
  const colors = [
    Color.Blue,
    Color.Green,
    Color.Orange,
    Color.Purple,
    Color.Red,
    Color.Yellow,
    Color.Magenta,
    Color.PrimaryText,
  ];

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i)) % colors.length;
  }

  return colors[hash];
};
