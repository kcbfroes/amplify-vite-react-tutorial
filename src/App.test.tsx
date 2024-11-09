import { render, screen } from '@testing-library/react'
import App from './App'
import { describe, it, expect } from 'vitest'
import { AppDataContext } from './context/AppDataContext';

var mockContextValue = {
  client: null, 
  todos: [],
  people: [],
  allDataSynced: true,   
};

describe('App Component Tests', () => {
  it('renders the App component if context is available', () => {
    render(
      <AppDataContext.Provider value={mockContextValue}>
        <App />
      </AppDataContext.Provider>
    )
  })
  it('throws an error if app context is not available', () => {
    const result = () => render(<App/>)
    expect(result).toThrowError("AppContext is not available")
  })
  
  mockContextValue.allDataSynced = false
  it('shows data is loading message', () => {
    const result = () => render(<AppDataContext.Provider value={mockContextValue}><App /></AppDataContext.Provider>)
    
    expect(result).toContainElement()
  })
})