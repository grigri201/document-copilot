'use client';

import { GitPatchBlockElement, GitPatchLineElement } from '@/components/ui/git-patch-element';
import { BaseGitPatchBlockPlugin, BaseGitPatchLinePlugin } from './git-patch-base-kit';

export const GitPatchKit = [
  BaseGitPatchBlockPlugin.withComponent(GitPatchBlockElement),
  BaseGitPatchLinePlugin.withComponent(GitPatchLineElement),
];