import './global.css'

export const metadata = {
    title: 'F1GPT',
    description: 'A GPT-based application for Formula 1 fans'
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang='en'>
            <body suppressHydrationWarning={true}>
                {children}
            </body>
        </html>
    )
}

export default RootLayout