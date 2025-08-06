import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText(/Vite \+ React Test/i)).toBeInTheDocument()
  })

  it('should increment count when button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const button = screen.getByRole('button', { name: /COUNT IS/i })
    expect(button).toHaveTextContent('COUNT IS 0')
    
    await user.click(button)
    expect(button).toHaveTextContent('COUNT IS 1')
    
    await user.click(button)
    expect(button).toHaveTextContent('COUNT IS 2')
  })

  it('should render React and Vite logos', () => {
    render(<App />)
    
    const reactLogo = screen.getByAltText('React logo')
    const viteLogo = screen.getByAltText('Vite logo')
    
    expect(reactLogo).toBeInTheDocument()
    expect(viteLogo).toBeInTheDocument()
  })

  it('should have links to Vite and React websites', () => {
    render(<App />)
    
    const viteLink = screen.getByRole('link', { name: /vite logo/i })
    const reactLink = screen.getByRole('link', { name: /react logo/i })
    
    expect(viteLink).toHaveAttribute('href', 'https://vite.dev')
    expect(reactLink).toHaveAttribute('href', 'https://react.dev')
  })

  it('should display instructional text', () => {
    render(<App />)
    
    expect(screen.getByText(/Click on the Vite and React logos to learn more/i)).toBeInTheDocument()
  })
})
