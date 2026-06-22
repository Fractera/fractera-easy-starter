import { buildFrameworkData, type FrameworkData } from '../../_lib/post'

// This page's _data — generated from the framework registry (name substituted
// everywhere). The /framework catalog _list reads it via lib/parser-fs.
export const data: FrameworkData = buildFrameworkData('react-router')
