import { useState } from 'react';
import { View, Text, Input, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { useMarketStore } from '@/stores/useMarketStore';
import { chooseImage, uploadFile } from '@/services/cloud';
import type { SellerType } from '@/types';
import './index.scss';

const CATEGORIES = [
  { key: '用品', emoji: '🦴' },
  { key: '食品', emoji: '🍖' },
  { key: '服务', emoji: '✂️' },
  { key: '穿搭', emoji: '👕' },
  { key: '纪念', emoji: '🖼️' },
  { key: '医疗', emoji: '💊' },
];

const SELLER_TYPES: { key: SellerType; label: string; desc: string }[] = [
  { key: 'personal', label: '♻️ 个人二手', desc: '闲置转让、同城面交' },
  { key: 'merchant', label: '🛍️ 商家', desc: '店铺销售、包邮发货' },
];

// 商品图标 + 背景色组合，作为商品的"主图"
const ICON_OPTIONS = [
  { emoji: '🦴', bg: 'linear-gradient(135deg,#FFF0EA,#FFE4D6)' },
  { emoji: '🍖', bg: 'linear-gradient(135deg,#FFF3E0,#FFE0B2)' },
  { emoji: '🏠', bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)' },
  { emoji: '🎾', bg: 'linear-gradient(135deg,#E3F2FD,#BBDEFB)' },
  { emoji: '👕', bg: 'linear-gradient(135deg,#FFEBEE,#FFCDD2)' },
  { emoji: '🧸', bg: 'linear-gradient(135deg,#F3E5F5,#E1BEE7)' },
  { emoji: '🪥', bg: 'linear-gradient(135deg,#FFF8E1,#FFECB3)' },
  { emoji: '🎁', bg: 'linear-gradient(135deg,#E0F7FA,#B2EBF2)' },
];

export default function CreateProductPage() {
  const addProduct = useMarketStore((s) => s.addProduct);

  const showToast = (text: string, icon: 'success' | 'none' = 'none') => {
    Taro.showToast({ title: text, icon });
  };

  const [name, setName] = useState('');
  const [sellerType, setSellerType] = useState<SellerType>('personal');
  const [category, setCategory] = useState('用品');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [description, setDescription] = useState('');
  const [iconIndex, setIconIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChooseImage = async () => {
    if (images.length >= 9) {
      showToast('最多选择9张照片');
      return;
    }
    const paths = await chooseImage(9 - images.length);
    if (paths.length > 0) setImages([...images, ...paths]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSellerTypeChange = (key: SellerType) => {
    setSellerType(key);
    // 个人卖家不允许发布医疗类商品，切换到个人时自动退回默认分类
    if (key === 'personal' && category === '医疗') setCategory('用品');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('请输入商品名称');
      return;
    }
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      showToast('请输入正确的价格');
      return;
    }
    const oldPriceNum = parseFloat(oldPrice);
    const icon = ICON_OPTIONS[iconIndex];

    if (sellerType === 'personal' && category === '医疗') {
      showToast('个人卖家不能发布医疗类商品');
      return;
    }

    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        uploadedUrls.push(await uploadFile(images[i], `products/${Date.now()}_${i}.jpg`));
      }

      await addProduct({
        name: name.trim(),
        category,
        sellerType,
        price: Math.round(priceNum * 10) / 10,
        oldPrice: oldPrice && !isNaN(oldPriceNum) ? oldPriceNum : priceNum,
        emoji: icon.emoji,
        bg: icon.bg,
        description: description.trim() || undefined,
        images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });

      showToast('上架成功！', 'success');
      setTimeout(() => Taro.navigateBack(), 800);
    } catch (err) {
      console.error('[createProduct]', err);
      showToast('上架失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className='create-product-page'>
      <SubPageHeader title='上架商品' />

      {/* 出售类型 */}
      <View className='cpr-section'>
        <Text className='cpr-label'>出售类型</Text>
        <View className='cpr-seller-types'>
          {SELLER_TYPES.map((st) => (
            <View
              key={st.key}
              className={`cpr-seller-type ${sellerType === st.key ? 'active' : ''}`}
              onClick={() => handleSellerTypeChange(st.key)}
            >
              <Text className='cpr-seller-type-label'>{st.label}</Text>
              <Text className='cpr-seller-type-desc'>{st.desc}</Text>
              {sellerType === st.key && <Text className='cpr-seller-type-check'>✓</Text>}
            </View>
          ))}
        </View>
      </View>

      {/* 商品名称 */}
      <View className='cpr-section'>
        <Text className='cpr-label'>商品名称</Text>
        <Input
          className='cpr-input'
          placeholder='例如：天然磨牙洁齿骨'
          placeholderClass='cpr-placeholder'
          value={name}
          onInput={(e) => setName(e.detail.value)}
          maxlength={30}
        />
      </View>

      {/* 分类 */}
      <View className='cpr-section'>
        <Text className='cpr-label'>商品分类</Text>
        <View className='cpr-cats'>
          {CATEGORIES.map((cat) => {
            const disabled = sellerType === 'personal' && cat.key === '医疗';
            return (
              <View
                key={cat.key}
                className={`cpr-cat ${category === cat.key ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => { if (!disabled) setCategory(cat.key); }}
              >
                <Text>{cat.emoji} {cat.key}</Text>
              </View>
            );
          })}
        </View>
        {sellerType === 'personal' && (
          <Text className='cpr-cat-hint'>个人卖家暂不支持发布医疗类商品</Text>
        )}
      </View>

      {/* 价格 */}
      <View className='cpr-section'>
        <Text className='cpr-label'>价格</Text>
        <View className='cpr-price-row'>
          <View className='cpr-price-item'>
            <Text className='cpr-price-tag'>售价 ¥</Text>
            <Input
              className='cpr-price-input'
              type='digit'
              placeholder='0.00'
              placeholderClass='cpr-placeholder'
              value={price}
              onInput={(e) => setPrice(e.detail.value)}
            />
          </View>
          <View className='cpr-price-item'>
            <Text className='cpr-price-tag'>原价 ¥</Text>
            <Input
              className='cpr-price-input'
              type='digit'
              placeholder='选填'
              placeholderClass='cpr-placeholder'
              value={oldPrice}
              onInput={(e) => setOldPrice(e.detail.value)}
            />
          </View>
        </View>
      </View>

      {/* 商品照片 */}
      <View className='cpr-section'>
        <Text className='cpr-label'>商品照片 ({images.length}/9)</Text>
        <View className='cpr-images'>
          {images.map((img, i) => (
            <View key={i} className='cpr-image-item'>
              <Image className='cpr-image' src={img} mode='aspectFill' />
              <View className='cpr-image-remove' onClick={() => handleRemoveImage(i)}>
                <Text>✕</Text>
              </View>
            </View>
          ))}
          {images.length < 9 && (
            <View className='cpr-image-add' onClick={handleChooseImage}>
              <Text className='cpr-add-icon'>+</Text>
              <Text className='cpr-add-text'>拍照/相册</Text>
            </View>
          )}
        </View>
      </View>

      {/* 商品图标 */}
      <View className='cpr-section'>
        <Text className='cpr-label'>选择商品图标（无照片时显示）</Text>
        <View className='cpr-icons'>
          {ICON_OPTIONS.map((icon, i) => (
            <View
              key={i}
              className={`cpr-icon ${iconIndex === i ? 'active' : ''}`}
              style={{ background: icon.bg }}
              onClick={() => setIconIndex(i)}
            >
              <Text className='cpr-icon-emoji'>{icon.emoji}</Text>
              {iconIndex === i && <Text className='cpr-icon-check'>✓</Text>}
            </View>
          ))}
        </View>
      </View>

      {/* 描述 */}
      <View className='cpr-section'>
        <Text className='cpr-label'>商品描述</Text>
        <Textarea
          className='cpr-textarea'
          value={description}
          onInput={(e) => setDescription(e.detail.value)}
          placeholder='介绍一下你的商品（选填）'
          placeholderClass='cpr-placeholder'
          maxlength={200}
          autoHeight
        />
      </View>

      {/* 提交 */}
      <View className='cpr-footer'>
        <View className='cpr-submit-btn' onClick={handleSubmit}>
          <Text>{submitting ? '上架中…' : '发布商品'}</Text>
        </View>
      </View>
    </View>
  );
}
