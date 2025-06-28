export default function FallbackComponent({error}) {
  return (
    <div role="alert">
      <p>An error has occurred:</p>
      <pre>{error.message}</pre>
    </div>
  )
}
