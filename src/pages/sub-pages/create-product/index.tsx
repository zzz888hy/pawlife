import { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { useMarketStore } from '@/stores/useMarketStore';
import { useAppStore } from '@/stores/useAppStore';
import './index.scss';

const CATEGORIES = [
  { key: '用品', emoji: '🦴' },
  { key: '食品', emoji: '🍖' },
  { key: '服务', emoji: '✂️' },
  { key: '穿搭', emoji: '👕' },
  { key: '纪念', emoji: '🖼️' },
  { key: '医疗', emoji: '💊' },
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
  const showToast = useAppStore((s) => s.showToast);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('用品');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [description, setDescription] = useState('');
  const [iconIndex, setIconIndex] = useState(0);

  const handleSubmit = () => {
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

    addProduct({
      name: name.trim(),
      category,
      price: Math.round(priceNum * 10) / 10,
      oldPrice: oldPrice && !isNaN(oldPriceNum) ? oldPriceNum : priceNum,
      emoji: icon.emoji,
      bg: icon.bg,
      description: description.trim() || undefined,
    });

    Taro.showToast({ title: '上架成功！', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  return (
    <View className='create-product-page'>
      <SubPageHeader title='上架商品' />

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
          {CATEGORIES.map((cat) => (
            <View
              key={cat.key}
              className={`cpr-cat ${category === cat.key ? 'active' : ''}`}
              onClick={() => setCategory(cat.key)}
            >
              <Text>{cat.emoji} {cat.key}</Text>
            </View>
          ))}
        </View>
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

      {/* 商品图标 */}
      <View className='cpr-section'>
        <Text className='cpr-label'>选择商品图标</Text>
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
          <Text>发布商品</Text>
        </View>
      </View>
    </View>
  );
}
