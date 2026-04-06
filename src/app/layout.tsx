import type { Metadata } from 'next'
import { Inter, Noto_Serif_SC } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const notoSansSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  fallback: ['serif', 'SimSun', 'STSong', 'NSimSun']
})

export const metadata: Metadata = {
  title: '敦煌吐鲁番文献检索与上传',
  description: '敦煌吐鲁番文献检索与上传系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} ${notoSansSC.className}`}>
        {children}
      </body>
    </html>
  )
}