//actions.ts
'use server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000/api';

export async function askQuestion(question: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const data = await response.json();
    return { success: true, answer: data.answer || 'No response received.' };
  } catch (error) {
    return { success: false, answer: 'Failed to get response. Please try again.' };
  }
}

export async function listDocuments() {
  try {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const data = await response.json();
    return { success: true, documents: data.documents || [] };
  } catch (error) {
    return { success: false, documents: [] };
  }
}

export async function uploadDocument(formData: FormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}