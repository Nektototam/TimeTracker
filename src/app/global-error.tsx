"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
        margin: 0,
      }}>
        <h1>Something went wrong!</h1>
        <button
          onClick={() => reset()}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
