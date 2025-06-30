export const testEmailConnection = async () => {
  try {
    const response = await fetch('/api/test-connection');
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}; 