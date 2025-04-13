
  const flutterwaveConfig = {
    public_key: "FLWPUBK_TEST-f2a20c8d451aa374570b6b93e90c127a-X",
    tx_ref: `FLYS-${Date.now().toString()}`,
    amount: calculateGrandTotal().toString(), // Convert amount to string
    currency: 'KES',
    payment_options: 'mpesa',
    customer: {
      email: formData.email,
      phone_number: formData.phone,
      name: `${formData.firstName} ${formData.lastName}`,
    },
    customizations: {
      title: 'FlySafari Flight Booking',
      description: `Booking for flight ${flight?.flight_number} from ${flight?.departure_city} to ${flight?.arrival_city}`,
      logo: 'https://cdn-icons-png.flaticon.com/512/5403/5403491.png',
    },
  };
