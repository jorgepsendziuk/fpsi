import "@refinedev/mui";

export interface CustomTheme {
  // Add custom variables here like below:
  // status: {
  //   danger: string;
  // };
}

declare module "@refinedev/mui" {
  interface Theme extends CustomTheme {}
  interface ThemeOptions extends CustomTheme {}
}
