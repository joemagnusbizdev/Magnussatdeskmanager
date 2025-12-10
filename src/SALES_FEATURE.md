# Sales Management Feature

## Overview
The Sales Management feature has been added to the inReach Manager dashboard to handle permanent device sales (as opposed to temporary rentals). This feature includes comprehensive customer information management, multi-device sales tracking, and a powerful bulk user assignment capability.

## Key Features

### 1. Sales Tracking
- **Create New Sales**: Record permanent device sales with complete customer and company information
- **Multi-Device Support**: Assign multiple devices to a single sale transaction
- **SatDesk Assignment**: Link sales to specific SatDesks for organizational tracking
- **Status Management**: Track sales through lifecycle stages (Pending → Activated → Completed)
- **Payment Tracking**: Monitor payment status (Pending, Partial, Paid)

### 2. Customer Information
The system captures comprehensive customer data:
- Personal Information (First Name, Last Name, Email, Phone)
- Company Details (Company Name, VAT/Tax ID)
- Complete Billing Address
- Garmin Account Credentials (Username/Password)

### 3. Device Management
For each sale, you can add multiple devices with:
- IMEI Number
- Serial Number
- Device Model (inReach Mini 2, Messenger, Explorer+, GPSMAP 66i)

### 4. Bulk User Assignment ⭐
The **Bulk User Assignment** feature allows you to:
- Apply the same user information to multiple devices simultaneously
- Filter devices by SatDesk
- Select devices individually or in bulk
- Import user data from CSV files
- See real-time device selection count

#### CSV Import Format
```csv
firstName,lastName,email,phone,dateOfBirth,idPassport
John,Doe,john@example.com,+1-555-0100,1990-01-01,A12345678
```

## Navigation

### Sidebar
- **Sales** tab added between "Orders" and "Devices"
- Icon: ShoppingBag (🛍️)

### Routes
- `/sales` - Main sales dashboard
- `/sales/new` - Create new sale form

## Components Created

### Pages
1. **`/pages/Sales.tsx`**
   - Main sales dashboard with tabbed views
   - Statistics cards (Pending, Activated, Devices Sold, Revenue)
   - Filterable sales table
   - Detailed sale view dialog
   - Quick actions (Activate, Complete, Delete)

2. **`/pages/NewSale.tsx`**
   - Wrapper page for the new sale form
   - Consistent layout with other pages

### Components
1. **`/components/sales/NewSaleForm.tsx`**
   - Comprehensive form for creating new sales
   - Three main sections:
     - Customer Information (with billing address)
     - Device Information (with ability to add multiple devices)
     - Sale Details (SatDesk, date, amount, notes)
   - Dynamic device addition/removal
   - Form validation

2. **`/components/sales/BulkUserAssignment.tsx`**
   - Dual-panel dialog interface
   - Left panel: User information form with CSV import
   - Right panel: Device selection with filtering
   - Real-time selection feedback
   - Batch user assignment to multiple devices

### Store
**`/stores/salesStore.ts`**
- Manages all sales data
- Includes 3 mock sales for demonstration
- Actions:
  - `addSale()` - Create new sale
  - `updateSale()` - Update sale details
  - `deleteSale()` - Remove sale
  - `getSalesBySatDesk()` - Filter by SatDesk
  - `getSalesByStatus()` - Filter by status

## Data Models

### DeviceSale Interface
```typescript
{
  id: string;
  saleNumber: string;          // e.g., "SALE-2024-001"
  customer: SaleCustomer;       // Full customer details
  devices: Array<{              // Multiple devices per sale
    imei: string;
    deviceId?: string;
    serialNumber: string;
    model: string;
  }>;
  satDeskId: string;            // Associated SatDesk
  saleDate: string;
  activationDate?: string;
  status: 'pending' | 'activated' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'paid';
  totalAmount?: number;
  notes?: string;
  garminUsername?: string;
  garminPassword?: string;
  createdAt: string;
  updatedAt: string;
}
```

### SaleCustomer Interface
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  companyVAT?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}
```

## Usage Examples

### Creating a New Sale
1. Navigate to Sales page (`/sales`)
2. Click "New Sale" button
3. Fill in customer information
4. Add device details (can add multiple devices)
5. Select SatDesk and enter additional details
6. Click "Create Sale"

### Bulk User Assignment
1. Navigate to Sales page
2. Click "Bulk Assign User" button
3. Enter user information OR import from CSV
4. Filter devices by SatDesk (optional)
5. Select target devices
6. Click "Apply to X Device(s)"

### Managing Sales
- View all sales in the main table
- Click eye icon to view sale details
- Use tabs to filter by status
- Activate pending sales
- Mark activated sales as completed
- Delete pending sales if needed

## Styling & Branding
The Sales feature follows the Magnus brand guidelines:
- Purple gradient accents (from-primary to-accent)
- Bold, modern typography
- Consistent card-based layouts
- Responsive design for mobile/tablet/desktop
- Icon-driven UI with lucide-react icons

## Integration Points

### Existing Systems
- **SatDesk Store**: Sales are linked to SatDesks
- **Device Store**: Bulk assignment updates device user information
- **Toast Notifications**: Success/error feedback for all operations

### Future Enhancements
Potential areas for expansion:
- Integration with payment processing
- Automatic Garmin API activation
- Email notifications to customers
- Invoice generation
- Export sales reports
- Advanced search and filtering
- Sales analytics dashboard

## Technical Notes

### State Management
- Uses Zustand for predictable state management
- Mock data provided for development/testing
- Ready for API integration (follows existing pattern)

### Form Validation
- Required fields marked with red asterisk
- Client-side validation before submission
- User-friendly error messages via toast

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Dialog/modal interfaces for detail views
- Touch-friendly interactive elements

## Mock Data
The store includes 3 sample sales:
1. Arctic Expeditions Inc. - 2 devices (Completed)
2. Chilean Mountain Rescue - 1 device (Activated)
3. Himalaya Adventures - 3 devices (Pending)

This allows for immediate testing and demonstration of all features.
