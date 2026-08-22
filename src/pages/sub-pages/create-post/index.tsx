import { useEffect, useRef, useState } from 'react';
import { View, Text, Textarea, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useFeedStore } from '@/stores/useFeedStore';
import { usePetStore } from '@/stores/usePetStore';
import { useUserStore } from '@/stores/useUserStore';
import { useDraftStore } from '@/stores/useDraftStore';
import { chooseImage, uploadFile } from '@/services/cloud';
import { addUserCoins } from '@/services/auth';
import { isImageUrl } from '@/utils/format';
import type { FeedVisibility } from '@/types';
import {
  ACTIVITY_TYPES,
  PUBLISH_TARGETS,
  getActivity,
  todayStr,
  type PublishTarget,
} from '@/constants/record';
import './index.scss';

const TAG_OPTIONS = ['#金毛日常', '#猫咪日常', '#第一次', '#今日份快乐', '#最佳穿搭', '#饲养经验', '#宠物美食', '#健康记录'];

const PUBLISH_LABELS: Record<PublishTarget, string> = {
  record: '🐾 保存记录',
  feed: '📸 发布动态',
  draft: '💾 存草稿',
};

const VISIBILITY_OPTIONS: { key: FeedVisibility; label: string }[] = [
  { key: 'public', label: '🌍 公开' },
  { key: 'friends', label: '👥 好友可见' },
  { key: 'private', label: '🔒 仅自己可见' },
];

export default function CreatePostPage() {
  const router = useRouter();
  const mode = (router.params?.mode as string) || '';
  const editId = (router.params?.editId as string) || '';

  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activityKey, setActivityKey] = useState('');
  const [target, setTarget] = useState<PublishTarget>(mode === 'record' ? 'record' : 'feed');
  const [visibility, setVisibility] = useState<FeedVisibility>('public');
  const [editDate, setEditDate] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [aiCaption, setAiCaption] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const showToast = (text: string, icon: 'success' | 'none' = 'none') => {
    Taro.showToast({ title: text, icon });
  };
  const addFeed = useFeedStore((s) => s.addFeed);
  const updateFeed = useFeedStore((s) => s.updateFeed);
  const feedItems = useFeedStore((s) => s.feedItems);
  const fetchFeed = useFeedStore((s) => s.fetchFeed);
  const addRecord = usePetStore((s) => s.addRecord);
  const updateRecord = usePetStore((s) => s.updateRecord);
  const timeline = usePetStore((s) => s.timeline);
  const addCoins = useUserStore((s) => s.addCoins);
  const pets = usePetStore((s) => s.pets);
  const fetchPets = usePetStore((s) => s.fetchPets);
  const drafts = useDraftStore((s) => s.drafts);
  const loadDrafts = useDraftStore((s) => s.loadDrafts);
  const saveDraft = useDraftStore((s) => s.saveDraft);
  const removeDraft = useDraftStore((s) => s.removeDraft);

  const maxImages = target === 'record' ? 1 : 9;
  const prefilled = useRef(false);

  useEffect(() => {
    if (pets.length === 0 || editId) fetchPets();
    if (editId && mode !== 'record') fetchFeed();
    loadDrafts();
  }, []);

  // 编辑模式：从 store 回填数据
  useEffect(() => {
    if (!editId || prefilled.current) return;
    if (mode === 'record') {
      if (timeline.length === 0) return;
      const rec = timeline.find((t) => t.id === editId);
      if (!rec) return;
      setActivityKey(rec.activityKey || '');
      setText(rec.activityKey ? rec.desc || '' : rec.desc || rec.title || '');
      if (rec.imageUrl) setImages([rec.imageUrl]);
      setSelectedPetId(rec.petId || '');
      setEditDate(rec.date || '');
      setTarget('record');
      prefilled.current = true;
    } else {
      if (feedItems.length === 0) return;
      const f = feedItems.find((x) => x.id === editId);
      if (!f) return;
      setText(f.txt || '');
      setSelectedTags(f.tags || []);
      setImages(f.images || []);
      setVisibility(f.visibility || 'public');
      setTarget('feed');
      prefilled.current = true;
    }
  }, [editId, mode, timeline, feedItems]);

  useEffect(() => {
    const titles: Record<PublishTarget, string> = {
      record: editId ? '编辑记录' : '记录宠物',
      feed: editId ? '编辑动态' : '发布动态',
      draft: '存草稿',
    };
    Taro.setNavigationBarTitle({ title: titles[target] });
  }, [target, editId]);

  // 选中的宠物：优先按 id 找，找不到则回退到第一只
  const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0];

  // 选择图片
  const handleChooseImage = async () => {
    if (images.length >= maxImages) {
      showToast(`最多选择${maxImages}张图片`);
      return;
    }
    const paths = await chooseImage(maxImages - images.length);
    if (paths.length > 0) {
      setImages([...images, ...paths]);
    }
  };

  // 移除图片
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // AI 生成配文（仅动态发布）
  const handleAiCaption = async () => {
    if (!text && images.length === 0) {
      showToast('请先写点文字或上传照片');
      return;
    }
    setAiLoading(true);
    const petName = selectedPet?.name || '宝贝';
    setTimeout(() => {
      const captions = [
        `${petName}今天太可爱了！忍不住分享～🐾`,
        `记录${petName}的美好时光 ✨`,
        `${petName}的第${Math.floor(Math.random() * 1000)}天陪伴 💛`,
        `今天又是被${petName}治愈的一天 🥰`,
        `${petName}的小日常，每一刻都值得记录 📸`,
      ];
      setAiCaption(captions[Math.floor(Math.random() * captions.length)]);
      setAiLoading(false);
      showToast('AI 配文已生成！点击可替换正文');
    }, 800);
  };

  // 使用 AI 配文
  const handleUseAiCaption = () => {
    setText(aiCaption);
    setAiCaption('');
  };

  // 切换标签
  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      showToast('最多选择5个标签');
    }
  };

  // 恢复最近一篇草稿
  const handleRestoreDraft = () => {
    const latest = drafts[0];
    if (!latest) return;
    setActivityKey(latest.activityKey);
    setText(latest.text);
    setSelectedTags(latest.tags);
    setImages(latest.images);
    setTarget(latest.target);
    if (latest.petId) setSelectedPetId(latest.petId);
    removeDraft(latest.id);
    showToast('已恢复草稿', 'success');
  };

  // 图片处理：只有「已上传/真实远程」地址才跳过上传。
  // 开发者工具里 chooseImage 返回的本地临时路径形如 http://tmp/…（真机是 wxfile://），
  // 这些必须上传成 cloud:// fileID，否则临时链接失效后图片就看不到了。
  const isRemoteUrl = (img: string): boolean => {
    if (img.startsWith('cloud://') || img.startsWith('data:')) return true;
    if (img.startsWith('wxfile://')) return false;
    if (/^https?:\/\//.test(img)) {
      const host = img.replace(/^https?:\/\//, '').split(/[/?]/)[0];
      if (host === 'tmp' || host === 'localhost' || host.startsWith('127.0.0.1')) return false;
      return true;
    }
    return false;
  };

  const resolveImageUrl = async (img: string, cloudPath: string): Promise<string> => {
    if (isRemoteUrl(img)) return img;
    return uploadFile(img, cloudPath);
  };

  // 发布 / 记录 / 存草稿 / 保存修改
  const handlePublish = async () => {
    const activity = getActivity(activityKey);
    const hasText = !!text.trim();
    const hasImage = images.length > 0;

    // 存草稿：本地保存后返回（仅新建时）
    if (target === 'draft') {
      if (!activity && !hasText && !hasImage) {
        showToast('请先选择活动或写点内容');
        return;
      }
      saveDraft({
        petId: selectedPet?.id || '',
        activityKey,
        text,
        tags: selectedTags,
        images,
        target,
      });
      showToast('已存草稿', 'success');
      setTimeout(() => Taro.navigateBack(), 600);
      return;
    }

    // 个人记录：轻量，允许只选活动就保存
    if (target === 'record') {
      if (!activity && !hasText && !hasImage) {
        showToast('请选择活动或写点内容');
        return;
      }
      setPublishing(true);
      try {
        let imageUrl: string | undefined;
        if (images.length > 0) {
          imageUrl = await resolveImageUrl(images[0], `records/${Date.now()}.jpg`);
        }
        const recordData = {
          petId: selectedPet?.id || '',
          date: editId ? editDate || todayStr() : todayStr(),
          title: activity ? activity.label : text.trim().slice(0, 20) || '随手记录',
          desc: activity ? text.trim() : '',
          emoji: activity?.emoji || '🐾',
          imageUrl,
          activityKey: activity?.key,
        };
        if (editId) {
          await updateRecord(editId, recordData);
          showToast('已保存修改', 'success');
        } else {
          await addRecord(recordData);
          showToast('已记录 🐾', 'success');
        }
        setTimeout(() => Taro.navigateBack(), 800);
      } catch (err) {
        console.error('[record]', err);
        const raw = String((err as any)?.errMsg || (err as any)?.message || '未知错误');
        let hint = '';
        if (raw.includes('collection') || raw.includes('ResourceNotFound') || raw.includes('集合')) {
          hint = '集合名可能对不上，代码里用的是 pets_records（带下划线）。';
        } else if (raw.includes('FunctionName') || raw.includes('not exist') || raw.includes('不存在')) {
          hint = 'pet 云函数可能没部署，请右键 cloudfunctions/pet 上传部署。';
        }
        Taro.showModal({
          title: '保存失败',
          content: raw.slice(0, 120) + (hint ? '\n\n' + hint : ''),
          showCancel: false,
        });
      } finally {
        setPublishing(false);
      }
      return;
    }

    // 动态发布
    if (!hasText && !hasImage) {
      showToast('请写点文字或上传照片');
      return;
    }
    setPublishing(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        uploadedUrls.push(await resolveImageUrl(images[i], `feeds/${Date.now()}_${i}.jpg`));
      }

      let finalText = hasText ? text.trim() : uploadedUrls.length > 0 ? '分享照片 📸' : '';
      if (activity) {
        finalText = `${activity.emoji} ${activity.label}${finalText ? ' · ' + finalText : ''}`;
      }
      const tags = activity ? [`#${activity.label}`, ...selectedTags] : selectedTags;

      if (editId) {
        await updateFeed(editId, { txt: finalText, tags, images: uploadedUrls, visibility });
        showToast('已保存修改', 'success');
      } else {
        addFeed({
          petName: selectedPet?.name || '宝贝',
          petEmoji: selectedPet?.avatar || '🐾',
          breed: selectedPet?.breed || '',
          text: finalText,
          tags,
          images: uploadedUrls,
          category: tags.length > 0 ? tags[0].replace('#', '') : '推荐',
          visibility,
        });
        addCoins(5);                 // 本地即时 +5
        addUserCoins(5).catch(() => {});  // 后端持久化
        Taro.showToast({ title: '发布成功！+5 金币', icon: 'success' });
      }
      setTimeout(() => Taro.navigateBack(), editId ? 800 : 1500);
    } catch (err) {
      showToast(editId ? '保存失败，请重试' : '发布失败，请重试');
    } finally {
      setPublishing(false);
    }
  };

  const publishLabel = editId ? '💾 保存修改' : PUBLISH_LABELS[target];

  return (
    <View className='create-post-page'>
      {/* 草稿恢复横幅（仅新建时） */}
      {!editId && drafts.length > 0 && (
        <View className='cp-draft-banner' onClick={handleRestoreDraft}>
          <Text>📝 你有 {drafts.length} 篇草稿，点击恢复最近一篇</Text>
        </View>
      )}

      {/* 发布目标（仅新建时） */}
      {!editId && (
        <View className='cp-section'>
          <Text className='cp-label'>发布目标</Text>
          <View className='cp-targets'>
            {PUBLISH_TARGETS.map((t) => (
              <View
                key={t.key}
                className={`cp-target ${target === t.key ? 'active' : ''}`}
                onClick={() => setTarget(t.key)}
              >
                <Text className='cp-target-label'>{t.label}</Text>
                <Text className='cp-target-desc'>{t.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 选择宠物（新建或记录编辑可见） */}
      {(!editId || mode === 'record') && (
        <View className='cp-section'>
          <Text className='cp-label'>选择宠物</Text>
          <View className='cp-pet-options'>
            {pets.length > 0 ? (
              pets.map((pet) => (
                <View
                  key={pet.id}
                  className={`cp-pet-btn ${selectedPet?.id === pet.id ? 'active' : ''}`}
                  onClick={() => setSelectedPetId(pet.id)}
                >
                    {isImageUrl(pet.avatar) ? (
                      <Image className='cp-pet-avatar' src={pet.avatar} mode='aspectFill' />
                    ) : (
                      <Text>{pet.avatar}</Text>
                    )}
                    <Text>{pet.name}</Text>
                </View>
              ))
            ) : (
              <Text className='cp-no-pet'>暂无宠物，请先创建</Text>
            )}
          </View>
        </View>
      )}

      {/* 活动类型（新建或记录编辑可见） */}
      {(!editId || mode === 'record') && (
        <View className='cp-section'>
          <Text className='cp-label'>记录活动（可选）</Text>
          <View className='cp-activities'>
            {ACTIVITY_TYPES.map((a) => (
              <View
                key={a.key}
                className={`cp-activity ${activityKey === a.key ? 'active' : ''}`}
                onClick={() => setActivityKey(activityKey === a.key ? '' : a.key)}
              >
                <Text className='cp-activity-emoji'>{a.emoji}</Text>
                <Text className='cp-activity-label'>{a.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 文本输入 */}
      <View className='cp-section'>
        <View className='cp-label-row'>
          <Text className='cp-label'>{target === 'feed' ? '写点什么' : '备注（可选）'}</Text>
          {target === 'feed' && (
            <View className='cp-ai-btn' onClick={handleAiCaption}>
              <Text>{aiLoading ? '⏳ AI思考中…' : '🤖 AI帮我写'}</Text>
            </View>
          )}
        </View>
        <Textarea
          className='cp-textarea'
          value={text}
          onInput={(e) => setText(e.detail.value)}
          placeholder={`记录${selectedPet?.name || '宝贝'}的精彩瞬间...`}
          placeholderClass='cp-placeholder'
          maxlength={500}
          autoHeight
        />
        {aiCaption && (
          <View className='cp-ai-caption' onClick={handleUseAiCaption}>
            <Text className='cp-ai-caption-label'>💡 AI 生成的配文（点击使用）：</Text>
            <Text className='cp-ai-caption-text'>{aiCaption}</Text>
          </View>
        )}
      </View>

      {/* 图片上传 */}
      <View className='cp-section'>
        <Text className='cp-label'>添加图片 ({images.length}/{maxImages})</Text>
        <View className='cp-images'>
          {images.map((img, i) => (
            <View key={i} className='cp-image-item'>
              <Image className='cp-image' src={img} mode='aspectFill' />
              <View className='cp-image-remove' onClick={() => handleRemoveImage(i)}>
                <Text>✕</Text>
              </View>
            </View>
          ))}
          {images.length < maxImages && (
            <View className='cp-image-add' onClick={handleChooseImage}>
              <Text className='cp-add-icon'>+</Text>
              <Text className='cp-add-text'>拍照/相册</Text>
            </View>
          )}
        </View>
      </View>

      {/* 标签选择（仅动态发布） */}
      {target === 'feed' && (
        <View className='cp-section'>
          <Text className='cp-label'>添加标签 ({selectedTags.length}/5)</Text>
          <View className='cp-tags'>
            {TAG_OPTIONS.map((tag) => (
              <View
                key={tag}
                className={`cp-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => handleToggleTag(tag)}
              >
                <Text>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 谁可以看（仅动态） */}
      {target === 'feed' && (
        <View className='cp-section'>
          <Text className='cp-label'>谁可以看</Text>
          <View className='cp-visibilities'>
            {VISIBILITY_OPTIONS.map((v) => (
              <View
                key={v.key}
                className={`cp-visibility ${visibility === v.key ? 'active' : ''}`}
                onClick={() => setVisibility(v.key)}
              >
                <Text>{v.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 发布按钮 */}
      <View className='cp-footer'>
        <View className='cp-publish-btn' onClick={handlePublish}>
          <Text>{publishing ? '处理中…' : publishLabel}</Text>
        </View>
      </View>
    </View>
  );
}
