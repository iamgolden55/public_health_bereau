import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '../auth/register/page'
import { UserProvider } from '../contexts/user-context'
import { act } from 'react-dom/test-utils'

describe('Authentication Flow', () => {
    beforeEach(() => {
        // Clear localStorage
        localStorage.clear()
        // Reset fetch mocks
        jest.resetAllMocks()
    })

    test('Register Form Validation', async () => {
        render(
            <UserProvider>
                <RegisterPage />
            </UserProvider>
        )

        // Test empty form submission
        const submitButton = screen.getByRole('button', { name: /register/i })
        await act(async () => {
            fireEvent.click(submitButton)
        })

        // Should show validation errors
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()

        // Test invalid email
        await act(async () => {
            await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email')
            fireEvent.click(submitButton)
        })
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()

        // Test weak password
        await act(async () => {
            await userEvent.type(screen.getByLabelText(/password/i), 'weak')
            fireEvent.click(submitButton)
        })
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })

    test('Successful Registration', async () => {
        const mockFetch = jest.fn(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    message: "Account created. Please verify your email.",
                    user: {
                        id: 1,
                        email: 'test@example.com'
                    }
                })
            })
        )
        global.fetch = mockFetch

        render(
            <UserProvider>
                <RegisterPage />
            </UserProvider>
        )

        // Fill form with valid data
        await act(async () => {
            await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
            await userEvent.type(screen.getByLabelText(/password/i), 'Test123!')
            await userEvent.type(screen.getByLabelText(/first name/i), 'Test')
            await userEvent.type(screen.getByLabelText(/last name/i), 'User')
            await userEvent.type(screen.getByLabelText(/date of birth/i), '1990-01-01')
            await userEvent.selectOptions(screen.getByLabelText(/gender/i), 'M')
            
            fireEvent.click(screen.getByRole('button', { name: /register/i }))
        })

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/register/',
                expect.any(Object)
            )
        })

        // Should show success message
        expect(screen.getByText(/please verify your email/i)).toBeInTheDocument()
    })

    test('User Context Integration', async () => {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            is_verified: true
        }

        const mockFetch = jest.fn(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ user: mockUser })
            })
        )
        global.fetch = mockFetch

        render(
            <UserProvider>
                <div data-testid="user-email">{mockUser.email}</div>
            </UserProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email)
        })
    })
}) 