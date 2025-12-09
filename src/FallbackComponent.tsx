interface FallbackComponentProps {
  error: Error
}

export default function FallbackComponent({ error }: FallbackComponentProps) {
  return (
    <div role="alert">
      <p>An error has occurred:</p>
      <pre>{error.message}</pre>
    </div>
  )
}
