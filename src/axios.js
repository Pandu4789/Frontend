import axios from 'axios';

const fetchEvents = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/events');
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};
