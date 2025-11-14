// 导出dispatcher和所有处理器
export { applyStaticFx } from './dispatcher';
export type { StaticFxParams, StaticFxResult } from './dispatcher';

// 导出各个特效处理器
export { slowZoomInHandler } from './handlers/slow-zoom-in';