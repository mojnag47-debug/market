# NextGen Coding Standards

## 🛠️ Language-specific Guidelines

### TypeScript/Node.js
```typescript
// Class naming: PascalCase with descriptive nouns
class PaymentProcessor {
  // Method naming: camelCase verbs
  async processTransaction() {
    // Use async/await over promise chains
    try {
      const result = await db.transaction();
      return this.formatResult(result);
    } catch (error) {
      logger.error('Transaction failed', { error });
      throw new AppError('TRANSACTION_FAILED');
    }
  }
}
```

### Python (ML Services)
```python
# Function names: snake_case
def preprocess_data(input_df: pd.DataFrame) -> dict:
    """
    Args:
        input_df: Raw input dataframe
    
    Returns:
        dict: Processed features
    """
    # Use type hints and Google-style docstrings
    return {
        'normalized': StandardScaler().fit_transform(input_df),
        'encoded': OneHotEncoder().fit_transform(input_df)
    }
```

## 🔍 Code Quality
1. ESLint/Prettier: Must pass before commit
2. Test coverage: 80% minimum for critical paths
3. SonarQube: Zero critical issues

## 🔄 Git Practices
- Commit message format:
  ```
  [type](scope): description
  
  [body]
  
  Fixes #123
  ```
  
  Allowed types: feat|fix|docs|style|refactor|test|chore

## 🧪 Testing Standards
```typescript
// Test naming: should [expected behavior] when [state/condition]
describe('PaymentProcessor', () => {
  it('should throw INVALID_CURRENCY when currency is unsupported', async () => {
    await expect(processor.init({ currency: 'XYZ' }))
      .rejects.toThrow('INVALID_CURRENCY');
  });
});
```

## 📚 Documentation Requirements
1. JSDoc for all public methods
2. OpenAPI for REST endpoints
3. Rustdoc for blockchain components
4. Python docstrings following Google style

[//]: # (File path: docs/development/coding-standards.md)