import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './CheckedOut.css';

const CheckedOut = () => {
  const [checkedOutBookings, setCheckedOutBookings] = useState([]);
  const [searchText, setSearchText] = useState(''); // State for search term
  const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = String(date.getFullYear()).slice(-2); // Use 2-digit year
        return `${day}-${month}-${year}`;
    };

    const viewBooking = (reservationId) => {
        navigate(`/booking-summary/${reservationId}`);
    };

    // Calculate total due for a specific booking
    const calculateTotalDue = (booking) => {
        const totalPaid = (parseFloat(booking.advancePayment.amount) || 0) + (parseFloat(booking.totalReceived.amount) || 0);
        return Math.max(0, booking.totalAmount - totalPaid); // Ensure it's not negative
    };

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    // Filter for bookings where checkedOut is true
    const checkedOut = storedBookings.filter(booking => booking.checkedOut);
    setCheckedOutBookings(checkedOut);
  }, []);

    const filteredBookings = checkedOutBookings.filter(booking => {
        const searchLower = searchText.toLowerCase();
        const checkInDates = booking.bookingDetails.map(detail => detail.checkInDate).join(' ');
        const checkOutDates = booking.bookingDetails.map(detail => detail.checkOutDate).join(' ');

        return (
            booking.reservationId.toLowerCase().includes(searchLower) ||
            booking.guestInfo.name.toLowerCase().includes(searchLower) ||
            booking.guestInfo.phone.toLowerCase().includes(searchLower) ||
            checkInDates.toLowerCase().includes(searchLower) ||
            checkOutDates.toLowerCase().includes(searchLower)
        );
    });

  return (
    <div className="checked-out">
      <h2>Checked-Out Guests</h2>
        <div className="search-container">
            <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
        </div>
      {checkedOutBookings.length === 0 ? (
        <p>No bookings have been checked out yet.</p>
      ) : (
        <table className="checked-out-table">
          <thead>
            <tr>
              <th>Reservation ID</th>
              <th>Guest Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Rooms</th>
              <th>Adults/Children</th>
              <th>Extras</th>
              <th>Total Amount (BDT)</th>
              <th>Advance (BDT)</th>
              <th>Received (BDT)</th>
              <th>Due (BDT)</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.reservationId}>
                <td>{booking.reservationId}</td>
                <td>{booking.guestInfo.name}</td>
                <td>{booking.guestInfo.email}</td>
                <td>{booking.guestInfo.phone}</td>
                <td>{`${booking.guestInfo.address}, ${booking.guestInfo.city}, ${booking.guestInfo.country}`}</td>
                <td>
                  {booking.bookingDetails.map((roomDetail, index) => (
                    <div key={index}>{formatDate(roomDetail.checkInDate)}</div>
                  ))}
                </td>
                <td>
                  {booking.bookingDetails.map((roomDetail, index) => (
                    <div key={index}>{formatDate(roomDetail.checkOutDate)}</div>
                  ))}
                </td>
                <td>
                    {booking.bookingDetails.map((roomDetail, index) => (
                        <div key={index}>{roomDetail.room}</div>
                    ))}
                </td>
                <td>
                  {booking.bookingDetails.map((roomDetail, index) => (
                    <div key={index}>{roomDetail.adults} / {roomDetail.children}</div>
                  ))}
                </td>
                <td>
                    {booking.bookingDetails.map((roomDetail, index) => (
                        <div key={index}>
                        {roomDetail.extras.map((extra, extraIndex) => (
                            <div key={`extra-${index}-${extraIndex}`}>{extra.name} (Qty: {extra.quantity}, Price: {extra.price}{extra.nights && extra.nights > 1 ? `, Nights: ${extra.nights}` : ''})</div>
                        ))}
                        </div>
                    ))}
                </td>
                <td>{booking.totalAmount}</td>
                <td>{booking.advancePayment.amount}</td>
                <td>{booking.totalReceived.amount}</td>
                <td style={{ color: booking.totalDue > 0 ? '#ff6a6a' : 'inherit' }}>
                    {calculateTotalDue(booking)} {/* Use the function here */}
                </td>
                <td>
                    <span className="icon view-icon" onClick={() => viewBooking(booking.reservationId)}>👁️</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CheckedOut;
