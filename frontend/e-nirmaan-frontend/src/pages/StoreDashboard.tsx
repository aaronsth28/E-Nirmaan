export default function StoreDashboard() {
  // Mock inventory data
  const inventory = [
    { id: 1, name: 'Cement (50kg bags)', sku: 'CEM-001', quantity: 250, status: 'In Stock' },
    { id: 2, name: 'Steel Bars (12mm)', sku: 'STL-012', quantity: 45, status: 'Low' },
    { id: 3, name: 'Sand (cubic meters)', sku: 'SND-001', quantity: 0, status: 'Out' },
    { id: 4, name: 'Bricks (1000 pcs)', sku: 'BRK-001', quantity: 180, status: 'In Stock' },
    { id: 5, name: 'PVC Pipes (4 inch)', sku: 'PVC-004', quantity: 25, status: 'Low' },
    { id: 6, name: 'Electrical Wire (100m)', sku: 'ELC-001', quantity: 75, status: 'In Stock' },
  ];

  const stats = [
    { label: 'Total Items', value: inventory.length },
    { label: 'In Stock', value: inventory.filter(i => i.status === 'In Stock').length },
    { label: 'Low Stock', value: inventory.filter(i => i.status === 'Low').length },
    { label: 'Out of Stock', value: inventory.filter(i => i.status === 'Out').length },
  ];

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'In Stock':
        return 'badge-primary';
      case 'Low':
        return 'badge-warning';
      case 'Out':
        return 'badge-danger';
      default:
        return 'badge-primary';
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Store Dashboard</h1>
        <p className="page-subtitle">Manage inventory and material stock levels</p>
      </div>

      {/* Stats Grid */}
      <div className="section">
        <div className="grid grid-4">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Cards */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <h2>Inventory Overview</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-3">
              {inventory.map((item) => (
                <div key={item.id} className="inventory-card">
                  <div className="inventory-card-name">{item.name}</div>
                  <div className="inventory-card-sku">SKU: {item.sku}</div>
                  <div className="inventory-card-qty">{item.quantity} units</div>
                  <div className="inventory-card-footer">
                    <span className={`badge ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
