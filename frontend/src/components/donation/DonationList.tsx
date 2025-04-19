import React from 'react';

interface Donation {
  id: string;
  title: string;
  description: string;
  quantity: string;
  expiryDate: string;
  category: string;
}

interface DonationListProps {
  donations: Donation[];
}

export const DonationList: React.FC<DonationListProps> = ({ donations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {donations.map((donation) => (
        <div
          key={donation.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{donation.title}</h3>
          <p className="text-gray-600 mb-4">{donation.description}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Quantity:</span> {donation.quantity}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Category:</span> {donation.category}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Expires:</span>{' '}
              {new Date(donation.expiryDate).toLocaleString()}
            </p>
          </div>
          <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
            Request Donation
          </button>
        </div>
      ))}
    </div>
  );
}; 