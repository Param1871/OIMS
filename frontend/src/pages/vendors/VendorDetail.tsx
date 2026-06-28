import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { vendorApi } from '@/store/api/vendor.api';
import { ArrowLeft, Building2, MapPin, Mail, Phone, Loader2, Star, Clock, CheckCircle } from 'lucide-react';

const VendorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        if (!id) return;
        const res = await vendorApi.getById(id);
        if (res.success) setVendor(res.data);
      } catch (err) {
        console.error("Failed to load vendor details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Vendor not found</h3>
        <Link to="/vendors" className="mt-4 inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Vendors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/vendors" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{vendor.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Vendor Code: {vendor.vendorCode} | Status: {vendor.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Building2 className="w-5 h-5 mr-2 text-primary" /> Company Info</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Address</p>
                  <p className="text-sm text-gray-500">{vendor.address || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{vendor.city}, {vendor.state} {vendor.postalCode}</p>
                  <p className="text-sm text-gray-500">{vendor.country}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-500">{vendor.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">{vendor.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h3 className="text-lg font-bold text-gray-900 mb-4">Tax Details</h3>
             <div className="space-y-3">
               <div>
                 <p className="text-xs text-gray-500 uppercase">GST Number</p>
                 <p className="text-sm font-medium text-gray-900">{vendor.taxId || 'Not provided'}</p>
               </div>
               <div>
                 <p className="text-xs text-gray-500 uppercase">Currency</p>
                 <p className="text-sm font-medium text-gray-900">{vendor.currency || 'INR'}</p>
               </div>
             </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center">
              <Star className="w-8 h-8 text-yellow-400 mb-2 fill-current" />
              <h4 className="text-sm font-medium text-gray-500">Performance</h4>
              <p className="text-2xl font-bold text-gray-900">{vendor.performanceRating || 0}<span className="text-lg text-gray-400">/5</span></p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <h4 className="text-sm font-medium text-gray-500">Reliability</h4>
              <p className="text-2xl font-bold text-gray-900">{vendor.reliabilityScore || 0}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center">
              <Clock className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className="text-sm font-medium text-gray-500">On-Time Delivery</h4>
              <p className="text-2xl font-bold text-gray-900">N/A</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Purchase Orders</h3>
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg">
              No purchase orders found for this vendor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;