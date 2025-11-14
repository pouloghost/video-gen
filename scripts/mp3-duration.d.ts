declare module 'mp3-duration' {
  function duration(filePath: string): Promise<number>;
  export { duration };
}