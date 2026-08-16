import { useState } from 'react';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import SubPageHeader from '@/components/SubPageHeader';
import { useAppStore } from '@/stores/useAppStore';
import './index.scss';

const FAQS = [
  {
    q: '如何添加我的宠物？',
    a: '进入「宠物馆」页面，点击「添加我的宠物」按钮，填写宠物的品种、生日、性格等信息即可完成建档。',
  },
  {
    q: '如何为宠物进行身份认证？',
    a: '在「我的 → 宠物身份认证」中，选择需要认证的宠物，填写芯片号、疫苗本编号等信息并提交，等待审核通过即可。',
  },
  {
    q: '宠物金币怎么获取和使用？',
    a: '完成每日任务、发布动态、参与社区互动都可以获得金币。金币可在「集市」中兑换宠物用品和优惠券。',
  },
  {
    q: '如何发布动态？',
    a: '点击底部导航中间的「+」按钮，选择「发动态」，上传照片并填写文字后发布即可。',
  },
  {
    q: '星光纪念馆是什么？',
    a: '为已离世的毛孩子创建专属数字纪念馆，保存照片与回忆，让它们的故事永远留在数字星河中。',
  },
];

export default function HelpPage() {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [feedback, setFeedback] = useState('');
  const showToast = useAppStore((s) => s.showToast);

  const handleToggle = (idx: number) => {
    setExpanded(expanded === idx ? null : idx);
  };

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      showToast('请先填写反馈内容');
      return;
    }
    setFeedback('');
    showToast('反馈已提交，感谢你的建议！');
  };

  return (
    <View className='help-page'>
      <SubPageHeader title='帮助与反馈' />

      <ScrollView className='help-scroll' scrollY showScrollbar={false}>
        {/* FAQ */}
        <View className='help-section'>
          <Text className='help-section-title'>常见问题</Text>
          <View className='help-faq'>
            {FAQS.map((faq, idx) => (
              <View key={idx} className='faq-item'>
                <View className='faq-q' onClick={() => handleToggle(idx)}>
                  <Text className='faq-q-text'>{faq.q}</Text>
                  <Text className='faq-arrow'>{expanded === idx ? '⌃' : '⌄'}</Text>
                </View>
                {expanded === idx && (
                  <View className='faq-a'>
                    <Text className='faq-a-text'>{faq.a}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Feedback */}
        <View className='help-section'>
          <Text className='help-section-title'>意见反馈</Text>
          <View className='help-feedback'>
            <Textarea
              className='help-textarea'
              placeholder='请描述你遇到的问题或建议...'
              placeholderClass='help-textarea-placeholder'
              value={feedback}
              onInput={(e) => setFeedback(e.detail.value)}
              maxlength={500}
              autoHeight
            />
            <View className='help-submit' onClick={handleSubmitFeedback}>
              <Text>提交反馈</Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View className='help-contact'>
          <Text className='help-contact-title'>联系我们</Text>
          <Text className='help-contact-text'>客服邮箱：support@pawlife.app</Text>
          <Text className='help-contact-text'>工作时间：每天 9:00 - 21:00</Text>
        </View>

        <View className='help-bottom-safe' />
      </ScrollView>
    </View>
  );
}
