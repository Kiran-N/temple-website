import './globals.css'

export const metadata = {
  title: 'Lakshmi Chennakeshava Swami Temple - Yaramalapalli',
  description: 'Temple construction project with transparent donation and expense tracking',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
