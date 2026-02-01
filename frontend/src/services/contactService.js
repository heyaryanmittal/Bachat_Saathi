import api from './api';

// Contact service functions
export const contactService = {
  // Submit contact form (public)
  submitContactForm: async (formData) => {
    try {
      const response = await api.post('/contact', formData);
      return response.data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error.response?.data || { message: 'Failed to submit contact form' };
    }
  },

  // Get all contacts (admin only)
  getAllContacts: async (params = {}) => {
    try {
      const response = await api.get('/contact', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error.response?.data || { message: 'Failed to fetch contacts' };
    }
  },

  // Get single contact (admin only)
  getContact: async (id) => {
    try {
      const response = await api.get(`/contact/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error.response?.data || { message: 'Failed to fetch contact' };
    }
  },

  // Update contact (admin only)
  updateContact: async (id, updateData) => {
    try {
      const response = await api.put(`/contact/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error.response?.data || { message: 'Failed to update contact' };
    }
  },

  // Delete contact (admin only)
  deleteContact: async (id) => {
    try {
      const response = await api.delete(`/contact/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error.response?.data || { message: 'Failed to delete contact' };
    }
  },

  // Get contact statistics (admin only)
  getContactStats: async () => {
    try {
      const response = await api.get('/contact/stats/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      throw error.response?.data || { message: 'Failed to fetch contact statistics' };
    }
  }
};

export default contactService;
