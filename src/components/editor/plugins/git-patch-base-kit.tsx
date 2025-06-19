import { BaseParagraphPlugin } from 'platejs';
import { GitPatchBlockElement, GitPatchLineElement } from '@/components/ui/git-patch-element';

// Git patch block plugin - extends paragraph plugin
export const BaseGitPatchBlockPlugin = BaseParagraphPlugin.extend({
  key: 'git-patch-block',
  node: {
    type: 'git-patch-block',
    isElement: true,
    isBlock: true,
    component: GitPatchBlockElement,
  },
});

// Git patch line plugin for individual lines
export const BaseGitPatchLinePlugin = BaseParagraphPlugin.extend({
  key: 'git-patch-line',  
  node: {
    type: 'git-patch-line',
    isElement: true,
    isInline: false,
    component: GitPatchLineElement,
  },
});

export const BaseGitPatchKit = [
  BaseGitPatchBlockPlugin,
  BaseGitPatchLinePlugin,
];