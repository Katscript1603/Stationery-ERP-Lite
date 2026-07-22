import React, { useState, useEffect } from 'react';
import axios from 'axios';

const POSCheckout = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState('');

  // State cho Form thêm sản phẩm mới
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '', productName: '', costPrice: '', retailPrice: '', stockQuantity: '', minStockThreshold: 10
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
    }
  };

  // 1. Thêm sản phẩm mới vào Kho
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/products', {
        ...newProduct,
        costPrice: Number(newProduct.costPrice),
        retailPrice: Number(newProduct.retailPrice),
        stockQuantity: Number(newProduct.stockQuantity),
        minStockThreshold: Number(newProduct.minStockThreshold)
      });
      alert('🎉 Đã thêm sản phẩm mới vào kho thành công!');
      fetchProducts();
      setNewProduct({ sku: '', productName: '', costPrice: '', retailPrice: '', stockQuantity: '', minStockThreshold: 10 });
      setShowForm(false);
    } catch (error) {
      alert('❌ Lỗi khi thêm sản phẩm: ' + (error.response?.data?.message || error.message));
    }
  };

  // 2. MỚI THÊM: Hàm Cập nhật số lượng tồn kho trực tiếp trên Web
  const handleUpdateStock = async (product) => {
    const newQtyStr = prompt(
      `📦 NHẬP SỐ LƯỢNG TỒN KHO MỚI CHO:\n"${product.productName}"\n\n(Tồn kho hiện tại đang là: ${product.stockQuantity} cái)`,
      product.stockQuantity
    );

    if (newQtyStr !== null && newQtyStr.trim() !== '') {
      const newQty = Number(newQtyStr);
      if (isNaN(newQty) || newQty < 0) {
        alert('❌ Số lượng không hợp lệ! Vui lòng nhập số tự nhiên >= 0.');
        return;
      }

      try {
        await axios.put(`http://localhost:8080/api/products/${product.productId}/stock?quantity=${newQty}`);
        alert(`✅ Đã cập nhật tồn kho "${product.productName}" thành ${newQty} cái!`);
        fetchProducts(); // Tải lại danh sách để thấy số lượng mới
      } catch (error) {
        alert('❌ Lỗi cập nhật kho: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // 3. CÁC HÀM QUẢN LÝ GIỎ HÀNG (THÊM / TĂNG / GIẢM / XÓA)
  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      alert('Sản phẩm này đã HẾT HÀNG!');
      return;
    }
    const existingIndex = cart.findIndex((item) => item.productId === product.productId);
    if (existingIndex > -1) {
      increaseQty(product.productId);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const increaseQty = (productId) => {
    const item = cart.find(i => i.productId === productId);
    const product = products.find(p => p.productId === productId);
    if (item.quantity + 1 > product.stockQuantity) {
      alert('⚠️ Số lượng mua trong giỏ không được vượt quá số lượng tồn kho (' + product.stockQuantity + ')!');
      return;
    }
    setCart(cart.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
  };

  const decreaseQty = (productId) => {
    const item = cart.find(i => i.productId === productId);
    if (item.quantity === 1) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(i => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(i => i.productId !== productId));
  };

  // 4. Tính tiền & Thanh toán
  const subtotal = cart.reduce((sum, item) => sum + item.retailPrice * item.quantity, 0);
  const finalAmount = subtotal - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }
    const payload = {
      discountAmount: Number(discount),
      items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    };
    try {
      await axios.post('http://localhost:8080/api/pos/checkout', payload);
      setMessage('✅ Thanh toán thành công! Tồn kho đã tự động cập nhật.');
      setCart([]);
      setDiscount(0);
      fetchProducts();
    } catch (error) {
      setMessage('❌ Lỗi thanh toán: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', fontFamily: 'Arial' }}>
      {/* CỘT TRÁI: DANH MỤC SẢN PHẨM */}
      <div style={{ flex: 2 }}>
        <h2>📦 Danh Mục Văn Phòng Phẩm</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          style={{ marginBottom: '15px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          {showForm ? '❌ Đóng Form Nhập Kho' : '➕ Nhập Thêm Sản Phẩm Mới Vào Kho'}
        </button>

        {showForm && (
          <form onSubmit={handleAddProduct} style={{ padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0 }}>🏢 Form Nhập Kho Sản Phẩm Mới</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <input required placeholder="Mã SKU (VD: SKU009)" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} style={{ padding: '8px' }} />
              <input required placeholder="Tên sản phẩm" value={newProduct.productName} onChange={e => setNewProduct({...newProduct, productName: e.target.value})} style={{ padding: '8px' }} />
              <input required type="number" placeholder="Giá vốn (VNĐ)" value={newProduct.costPrice} onChange={e => setNewProduct({...newProduct, costPrice: e.target.value})} style={{ padding: '8px' }} />
              <input required type="number" placeholder="Giá bán lẻ (VNĐ)" value={newProduct.retailPrice} onChange={e => setNewProduct({...newProduct, retailPrice: e.target.value})} style={{ padding: '8px' }} />
              <input required type="number" placeholder="Số lượng nhập kho" value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})} style={{ padding: '8px' }} />
              <input required type="number" placeholder="Ngưỡng báo động hết hàng" value={newProduct.minStockThreshold} onChange={e => setNewProduct({...newProduct, minStockThreshold: e.target.value})} style={{ padding: '8px' }} />
            </div>
            <button type="submit" style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              💾 Lưu Vào Cơ Sở Dữ Liệu
            </button>
          </form>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {products.map((p) => (
            <div key={p.productId} style={{ border: p.stockQuantity <= p.minStockThreshold ? '2px solid red' : '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: p.stockQuantity <= p.minStockThreshold ? '#ffe6e6' : '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>{p.productName}</h4>
              <p style={{ margin: '5px 0' }}>Mã SKU: <strong>{p.sku}</strong></p>
              <p style={{ margin: '5px 0' }}>Giá bán: <strong style={{ color: '#28a745' }}>{p.retailPrice?.toLocaleString()} VNĐ</strong></p>
              <p style={{ margin: '5px 0 10px 0' }}>
                Tồn kho: <strong style={{ fontSize: '16px', color: p.stockQuantity <= p.minStockThreshold ? 'red' : '#000' }}>{p.stockQuantity}</strong>{' '}
                {p.stockQuantity <= p.minStockThreshold && (
                  <span style={{ color: 'red', fontWeight: 'bold', display: 'block', marginTop: '5px' }}>⚠️ CẢNH BÁO SẮP HẾT</span>
                )}
              </p>
              
              {/* CỤM NÚT BẤM: THÊM VÀO GIỎ & SỬA TỒN KHO */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button 
                  onClick={() => addToCart(p)} 
                  disabled={p.stockQuantity <= 0}
                  style={{ flex: 2, padding: '8px 10px', backgroundColor: p.stockQuantity > 0 ? '#17a2b8' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: p.stockQuantity > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
                  {p.stockQuantity > 0 ? '🛒 Thêm vào giỏ' : '❌ Hết hàng'}
                </button>
                
                {/* NÚT MỚI: SỬA TỒN KHO TRỰC TIẾP */}
                <button 
                  onClick={() => handleUpdateStock(p)}
                  style={{ flex: 1, padding: '8px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  title="Thay đổi số lượng tồn kho của sản phẩm này">
                  🔄 Sửa kho
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG POS */}
      <div style={{ flex: 1, borderLeft: '2px solid #ddd', paddingLeft: '20px' }}>
        <h2>🛒 Giỏ Hàng POS</h2>
        {message && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}
        
        {cart.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#666' }}>Chưa có sản phẩm nào trong giỏ...</p>
        ) : (
          cart.map((item) => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed #eee', paddingBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <strong>{item.productName}</strong>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '3px' }}>
                  {item.retailPrice?.toLocaleString()} VNĐ/cái
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <button onClick={() => decreaseQty(item.productId)} style={{ width: '28px', height: '28px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>-</button>
                <span style={{ minWidth: '25px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>{item.quantity}</span>
                <button onClick={() => increaseQty(item.productId)} style={{ width: '28px', height: '28px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>+</button>
                <button onClick={() => removeFromCart(item.productId)} style={{ width: '28px', height: '28px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }} title="Xóa món này">🗑️</button>
              </div>
            </div>
          ))
        )}
        
        <hr style={{ margin: '20px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Tạm tính:</span>
          <strong>{subtotal.toLocaleString()} VNĐ</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <span>Giám giá (VNĐ):</span>
          <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} style={{ width: '100px', padding: '5px', textAlign: 'right' }} />
        </div>
        <h3 style={{ color: '#d9534f', display: 'flex', justifyContent: 'space-between' }}>
          <span>Tổng thanh toán:</span>
          <span>{finalAmount > 0 ? finalAmount.toLocaleString() : 0} VNĐ</span>
        </h3>
        <button onClick={handleCheckout} style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', fontSize: '18px', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)' }}>
          💳 Hoàn Thành Đơn Hàng
        </button>
      </div>
    </div>
  );
};

export default POSCheckout;