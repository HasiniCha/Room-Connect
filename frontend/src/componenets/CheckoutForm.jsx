import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ bookingId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    

    const { data } = await axios.post('/api/payments/create-intent', { bookingId });
    
  
    const result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });
    
    if (result.error) {
      console.error(result.error.message);
    } else {
     
      dispatch(fetchMyBookings());
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay ${amount}
      </button>
    </form>
  );
};