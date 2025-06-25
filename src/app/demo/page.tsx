'use client';

import { useEffect } from 'react';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { useDiffHandlers } from '@/hooks/useDiffHandlers';
import { useClipboardHandlers } from '@/hooks/useClipboardHandlers';
import { EditorLayout } from '@/components/layouts/EditorLayout';

const DEMO_CONTENT = `今天也是和平的一天，飞天小女警要去上学了。清晨阳光透过窗帘，把木质课桌镀上一层金边。
花花抱着科学书，泡泡踮脚塞储物柜，毛毛绕操场飞两圈才落地。
刚坐定，警报器尖锐响起——恶霸猴闯入市政厅偷市长的午餐券。她们对视一眼，书包还没放好便旋转变身。
飞向天空时，她们在脑海排练数学公式，怕耽误学习。到市政厅，花花策划、泡泡歌声分散注意、毛毛冲击波夺回午餐券。
危机解除仅用十分钟。回到教室铃声才响，同学们还在打哈欠。校园广播还在播放晨间新闻，没人注意到这场悄然结束的空中战斗。她们收起能量光环，在课桌前端坐，等待数学测验的铃声第二次敲响。老师推眼镜笑道："看来又是你们。"三张小脸相视——拯救世界也要保持成绩！`;

const DEMO_DIFF = `-刚坐定，警报器尖锐响起——恶霸猴闯入市政厅偷市长的午餐券。她们对视一眼，书包还没放好便旋转变身。
+刚坐定，警报器尖锐响起——恶霸猴闯入市政厅偷市长的午餐券。那是一只狡猾灵活的改造猴，披着破斗篷，眼里闪烁着诡计的光。她们对视一眼，书包还没放好便旋转变身。`;

const DEMO_INSERTION_DIFF = `花花抱着科学书，泡泡踮脚塞储物柜，毛毛绕操场飞两圈才落地。
+教室里充满了早晨的活力，同学们三三两两地聊着天。
刚坐定，警报器尖锐响起——恶霸猴闯入市政厅偷市长的午餐券。她们对视一眼，书包还没放好便旋转变身。`;

export default function DemoPage() {
  const initialValue = DEMO_CONTENT.split('\n').map(line => ({
    type: 'p',
    children: [{ text: line }]
  }));

  const { editor, editorRef, getContent } = useDocumentEditor({ initialValue });
  const { attachHandlers } = useDiffHandlers(editorRef);
  const { handleAsk, handlePaste } = useClipboardHandlers({ 
    editorRef, 
    getContent,
    openAIUrl: 'https://chat.openai.com'
  });

  // Attach diff handlers to editor
  useEffect(() => {
    attachHandlers(editor);
  }, [editor, attachHandlers]);

  // Auto-paste demo diffs on load (optional - you can remove this if not needed)
  useEffect(() => {
    // You could add buttons to trigger these demo diffs instead
    console.log('Demo diffs available:', { DEMO_DIFF, DEMO_INSERTION_DIFF });
  }, []);

  return (
    <EditorLayout 
      editor={editor}
      onAsk={handleAsk}
      onPaste={handlePaste}
    />
  );
}