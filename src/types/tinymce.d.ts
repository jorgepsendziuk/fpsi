/**
 * Declarações de tipos para módulos TinyMCE
 * Resolve erros de TypeScript com imports dinâmicos dos assets do TinyMCE
 */

declare module 'tinymce/tinymce';
declare module 'tinymce/icons/default/icons.min.js';
declare module 'tinymce/themes/silver/theme.min.js';
declare module 'tinymce/models/dom/model.min.js';
declare module 'tinymce/skins/ui/oxide/skin.js';
declare module 'tinymce/skins/ui/oxide/content.js';
declare module 'tinymce/skins/content/default/content.js';

// Plugins
declare module 'tinymce/plugins/advlist';
declare module 'tinymce/plugins/autolink';
declare module 'tinymce/plugins/lists';
declare module 'tinymce/plugins/link';
declare module 'tinymce/plugins/charmap';
declare module 'tinymce/plugins/preview';
declare module 'tinymce/plugins/searchreplace';
declare module 'tinymce/plugins/visualblocks';
declare module 'tinymce/plugins/code';
declare module 'tinymce/plugins/fullscreen';
declare module 'tinymce/plugins/insertdatetime';
declare module 'tinymce/plugins/table';
declare module 'tinymce/plugins/wordcount'; 