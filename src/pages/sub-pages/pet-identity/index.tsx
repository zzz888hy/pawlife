import { useEffect, useState } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SubPageHeader from '@/components/SubPageHeader';
import { usePetStore } from '@/stores/usePetStore';
import { useIdentityStore } from '@/stores/useIdentityStore';
import { useAppStore } from '@/stores/useAppStore';
import type { IdentityStatus } from '@/types';
import './index.scss';

const STATUS_MAP: Record<IdentityStatus, { label: string; color: string; emoji: string }> = {
  unverified: { label: '未认证', color: '#FF9800', emoji: '🕐' },
  reviewing: { label: '审核中', color: '#2F80ED', emoji: '⏳' },
  verified: { label: '已认证', color: '#52C41A', emoji: '✅' },
};

export default function PetIdentityPage() {
  const pets = usePetStore((s) => s.pets);
  const fetchPets = usePetStore((s) => s.fetchPets);
  const records = useIdentityStore((s) => s.records);
  const applyIdentity = useIdentityStore((s) => s.applyIdentity);
  const showToast = useAppStore((s) => s.showToast);

  const [selectedPetId, setSelectedPetId] = useState('');
  const [chipNo, setChipNo] = useState('');
  const [vaccineNo, setVaccineNo] = useState('');
  const [pedigree, setPedigree] = useState('');

  useEffect(() => {
    fetchPets();
  }, []);

  const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0];
  const record = selectedPet
    ? records.find((r) => r.petId === selectedPet.id)
    : undefined;
  const status: IdentityStatus = record?.status || 'unverified';

  const handleSubmit = () => {
    if (!selectedPet) {
      showToast('请先选择宠物');
      return;
    }
    if (!chipNo.trim()) {
      showToast('请输入芯片号');
      return;
    }
    if (!vaccineNo.trim()) {
      showToast('请输入疫苗本编号');
      return;
    }
    applyIdentity({
      petId: selectedPet.id,
      chipNo: chipNo.trim(),
      vaccineNo: vaccineNo.trim(),
      pedigree: pedigree.trim(),
    });
    showToast('提交成功，等待审核');
  };

  const isSubmitted = status !== 'unverified';

  return (
    <View className='identity-page'>
      <SubPageHeader title='宠物身份认证' />

      <ScrollView className='identity-scroll' scrollY showScrollbar={false}>
        {/* 说明卡片 */}
        <View className='identity-hero'>
          <Text className='identity-hero-icon'>🪪</Text>
          <Text className='identity-hero-title'>宠物数字身份认证</Text>
          <Text className='identity-hero-desc'>
            为你的宠物建立官方数字身份，包含品种、血统、疫苗记录等信息。
            认证后可享受更多社区权益。
          </Text>
        </View>

        {/* 选择宠物 */}
        <View className='identity-section'>
          <Text className='identity-label'>选择宠物</Text>
          {pets.length === 0 ? (
            <View className='identity-no-pet'>
              <Text className='identity-no-pet-text'>还没有宠物，请先创建宠物档案</Text>
              <View
                className='identity-no-pet-btn'
                onClick={() => Taro.navigateTo({ url: '/pages/sub-pages/create-pet/index' })}
              >
                <Text>去创建</Text>
              </View>
            </View>
          ) : (
            <ScrollView className='identity-pet-row' scrollX showScrollbar={false}>
              {pets.map((pet) => (
                <View
                  key={pet.id}
                  className={`identity-pet-chip ${selectedPet?.id === pet.id ? 'active' : ''}`}
                  onClick={() => setSelectedPetId(pet.id)}
                >
                  <Text className='identity-pet-avatar'>{pet.avatar}</Text>
                  <Text className='identity-pet-name'>{pet.name}</Text>
                  <Text className='identity-pet-breed'>{pet.breed}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 认证状态 */}
        <View className='identity-section'>
          <Text className='identity-label'>认证状态</Text>
          <View
            className='identity-status-banner'
            style={{ backgroundColor: STATUS_MAP[status].color + '1a' }}
          >
            <Text className='identity-status-emoji'>{STATUS_MAP[status].emoji}</Text>
            <View className='identity-status-info'>
              <Text className='identity-status-title' style={{ color: STATUS_MAP[status].color }}>
                {STATUS_MAP[status].label}
              </Text>
              <Text className='identity-status-desc'>
                {status === 'unverified' && '填写下方信息，提交后进入审核'}
                {status === 'reviewing' && '资料已提交，预计 1-3 个工作日内审核完成'}
                {status === 'verified' && '恭喜，你的宠物已获得官方数字身份'}
              </Text>
            </View>
          </View>
        </View>

        {/* 认证信息表单（未认证时可填写） */}
        <View className='identity-section'>
          <Text className='identity-label'>认证资料</Text>
          <View className='identity-form-card'>
            <View className='identity-field'>
              <Text className='identity-field-label'>芯片号</Text>
              <Input
                className='identity-input'
                placeholder='例如：900188000000001'
                placeholderClass='identity-placeholder'
                value={chipNo}
                onInput={(e) => setChipNo(e.detail.value)}
                maxlength={20}
                disabled={isSubmitted}
              />
            </View>
            <View className='identity-field'>
              <Text className='identity-field-label'>疫苗本编号</Text>
              <Input
                className='identity-input'
                placeholder='例如：VAC-2025-0001'
                placeholderClass='identity-placeholder'
                value={vaccineNo}
                onInput={(e) => setVaccineNo(e.detail.value)}
                maxlength={20}
                disabled={isSubmitted}
              />
            </View>
            <View className='identity-field'>
              <Text className='identity-field-label'>血统说明</Text>
              <Textarea
                className='identity-textarea'
                placeholder='选填：父母血统、参赛经历等'
                placeholderClass='identity-placeholder'
                value={pedigree}
                onInput={(e) => setPedigree(e.detail.value)}
                maxlength={200}
                autoHeight
                disabled={isSubmitted}
              />
            </View>
          </View>
        </View>

        <View className='identity-bottom-safe' />
      </ScrollView>

      {/* 底部按钮 */}
      {!isSubmitted && (
        <View className='identity-footer'>
          <View className='identity-submit-btn' onClick={handleSubmit}>
            <Text>提交认证申请</Text>
          </View>
        </View>
      )}
    </View>
  );
}
