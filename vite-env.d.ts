/// <reference types="vite/client" />

// Lägg till stöd för alla asset-typer via @/-alias
declare module '@/*' {
  const src: string
  export default src
}
