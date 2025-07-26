import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MainMenu from '../MainMenu'

describe('MainMenu', () => {
  it('renders main menu buttons', () => {
    const mockOnStartGame = vi.fn()
    const mockOnAdminAccess = vi.fn()

    render(<MainMenu onStartGame={mockOnStartGame} onAdminAccess={mockOnAdminAccess} />)

    expect(screen.getByText('ابدأ المغامرة')).toBeInTheDocument()
    expect(screen.getByText('لوحة التحكم')).toBeInTheDocument()
  })

  it('calls onStartGame when start button is clicked', () => {
    const mockOnStartGame = vi.fn()
    const mockOnAdminAccess = vi.fn()

    render(<MainMenu onStartGame={mockOnStartGame} onAdminAccess={mockOnAdminAccess} />)

    const startButton = screen.getByText('ابدأ المغامرة')
    fireEvent.click(startButton)

    expect(mockOnStartGame).toHaveBeenCalledTimes(1)
  })

  it('calls onAdminAccess when admin button is clicked', () => {
    const mockOnStartGame = vi.fn()
    const mockOnAdminAccess = vi.fn()

    render(<MainMenu onStartGame={mockOnStartGame} onAdminAccess={mockOnAdminAccess} />)

    const adminButton = screen.getByText('لوحة التحكم')
    fireEvent.click(adminButton)

    expect(mockOnAdminAccess).toHaveBeenCalledTimes(1)
  })
})
