export const SeperateList = ({
  data,
  by = "\u2022",
}: {
  data: (string | undefined | null)[];
  by?: string;
}) => {
  return data.filter((i) => !!i).join(` ${by} `);
};
