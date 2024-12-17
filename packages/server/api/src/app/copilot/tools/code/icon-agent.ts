import { generateObject, LanguageModel } from 'ai'
import { z } from 'zod'
import { Message } from './types'
import { system } from '../../../helper/system/system'
import { exceptionHandler } from '@activepieces/server-shared'

const iconSelectionSchema = z.object({
    icon: z.string(),
    explanation: z.string(),
    isNewRequest: z.boolean().default(true),
})

export async function selectIcon(model: LanguageModel, requirement: string, conversationHistory: Message[] = []): Promise<string | null> {
    try {
        // Check if there's a previous icon in the conversation history
        const lastAssistantMessage = [...conversationHistory].reverse().find(msg => msg.role === 'assistant')
        const previousIcon = lastAssistantMessage?.content.match(/"icon":\s*"([^"]+)"/)?.[1]


        const systemPrompt = `
        You are an expert at selecting the most appropriate icon for automation flows.
        Your task is to analyze the automation requirement and select the most suitable icon from the available set.

        CONTEXT ANALYSIS:
        1. Understand the core action/operation in the requirement
        2. Identify key themes (e.g., data processing, communication, file handling)
        3. Consider the user's perspective and what icon would be most intuitive
        4. Look for specific technical terms that map to certain icon categories
        5. Determine if this is a new request or a modification of the previous request

        SELECTION CRITERIA:
        - Primary function of the automation
        - Data type being handled
        - Industry-standard symbols for the operation
        - User recognition and familiarity
        - Visual clarity and purpose communication

        CONVERSATION HISTORY:
        ${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

        PREVIOUS ICON: ${previousIcon || 'none'}

        AVAILABLE ICONS:
        ${icons.join(' ')}

        YOU MUST RESPOND WITH THIS EXACT FORMAT:
        {
            "icon": "name-of-selected-icon",
            "explanation": "Why this icon was chosen",
            "isNewRequest": true/false (REQUIRED: true if this is a new/different requirement, false if it's a modification)
        }

        IMPORTANT RULES:
        1. ALWAYS include isNewRequest in your response (true/false)
        2. Choose ONLY from the provided icon list
        3. If this is a modification/enhancement of the previous requirement, reuse the previous icon
        4. Only select a new icon if the requirement is substantially different
        
        EXAMPLES OF VALID RESPONSES:
        For a new request:
        {
            "icon": "mail",
            "explanation": "This icon represents email functionality",
            "isNewRequest": true
        }

        For a modification:
        {
            "icon": "database",
            "explanation": "Reusing previous icon as this is an enhancement",
            "isNewRequest": false
        }`

        const llmResponse = await generateObject({
            model,
            system: systemPrompt,
            schema: iconSelectionSchema,
            prompt: `Analyze this automation requirement and determine if it needs a new icon: ${requirement}

            Consider and EXPLICITLY answer:
            1. Is this a new/different requirement (true) or a modification of the previous one (false)?
            2. What is the primary operation? (e.g., data processing, communication, file handling)
            3. What type of data or service is being handled?
            4. What would users expect to see for this type of automation?
            5. Should we reuse the previous icon (${previousIcon || 'none'}) or select a new one?

            Remember: You MUST include "isNewRequest" (true/false) in your response.`,
            temperature: 0,
        })

        system.globalLogger().debug({
            requirement,
            selectedIcon: llmResponse?.object?.icon,
            explanation: llmResponse?.object?.explanation,
            isNewRequest: llmResponse?.object?.isNewRequest,
            previousIcon,
        }, '[selectIcon] Icon selection response')

        // If it's not a new request and we have a previous icon, reuse it
        if (!llmResponse?.object?.isNewRequest && previousIcon) {
            return previousIcon
        }

        if (!llmResponse?.object?.icon || !icons.includes(llmResponse.object.icon)) {
            return null
        }

        return `https://cdn.activepieces.com/pieces/ai/code/${llmResponse.object.icon}.svg`
    }
    catch (error) {
        exceptionHandler.handle(error, system.globalLogger())
        return null
    }
}

const icons = [
    'a-arrow-down',
    'a-arrow-up',
    'a-large-small',
    'accessibility',
    'activity',
    'air-vent',
    'airplay',
    'alarm-clock-check',
    'alarm-clock-minus',
    'alarm-clock-off',
    'alarm-clock-plus',
    'alarm-clock',
    'alarm-smoke',
    'album',
    'align-center-horizontal',
    'align-center-vertical',
    'align-center',
    'align-end-horizontal',
    'align-end-vertical',
    'align-horizontal-distribute-center',
    'align-horizontal-distribute-end',
    'align-horizontal-distribute-start',
    'align-horizontal-justify-center',
    'align-horizontal-justify-end',
    'align-horizontal-justify-start',
    'align-horizontal-space-around',
    'align-horizontal-space-between',
    'align-justify',
    'align-left',
    'align-right',
    'align-start-horizontal',
    'align-start-vertical',
    'align-vertical-distribute-center',
    'align-vertical-distribute-end',
    'align-vertical-distribute-start',
    'align-vertical-justify-center',
    'align-vertical-justify-end',
    'align-vertical-justify-start',
    'align-vertical-space-around',
    'align-vertical-space-between',
    'ambulance',
    'ampersand',
    'ampersands',
    'amphora',
    'anchor',
    'angry',
    'annoyed',
    'antenna',
    'anvil',
    'aperture',
    'app-window-mac',
    'app-window',
    'apple',
    'archive-restore',
    'archive-x',
    'archive',
    'armchair',
    'arrow-big-down-dash',
    'arrow-big-down',
    'arrow-big-left-dash',
    'arrow-big-left',
    'arrow-big-right-dash',
    'arrow-big-right',
    'arrow-big-up-dash',
    'arrow-big-up',
    'arrow-down-0-1',
    'arrow-down-1-0',
    'arrow-down-a-z',
    'arrow-down-from-line',
    'arrow-down-left',
    'arrow-down-narrow-wide',
    'arrow-down-right',
    'arrow-down-to-dot',
    'arrow-down-to-line',
    'arrow-down-up',
    'arrow-down-wide-narrow',
    'arrow-down-z-a',
    'arrow-down',
    'arrow-left-from-line',
    'arrow-left-right',
    'arrow-left-to-line',
    'arrow-left',
    'arrow-right-from-line',
    'arrow-right-left',
    'arrow-right-to-line',
    'arrow-right',
    'arrow-up-0-1',
    'arrow-up-1-0',
    'arrow-up-a-z',
    'arrow-up-down',
    'arrow-up-from-dot',
    'arrow-up-from-line',
    'arrow-up-left',
    'arrow-up-narrow-wide',
    'arrow-up-right',
    'arrow-up-to-line',
    'arrow-up-wide-narrow',
    'arrow-up-z-a',
    'arrow-up',
    'arrows-up-from-line',
    'asterisk',
    'at-sign',
    'atom',
    'audio-lines',
    'audio-waveform',
    'award',
    'axe',
    'axis-3d',
    'baby',
    'backpack',
    'badge-alert',
    'badge-cent',
    'badge-check',
    'badge-dollar-sign',
    'badge-euro',
    'badge-help',
    'badge-indian-rupee',
    'badge-info',
    'badge-japanese-yen',
    'badge-minus',
    'badge-percent',
    'badge-plus',
    'badge-pound-sterling',
    'badge-russian-ruble',
    'badge-swiss-franc',
    'badge-x',
    'badge',
    'baggage-claim',
    'ban',
    'banana',
    'bandage',
    'banknote',
    'barcode',
    'baseline',
    'bath',
    'battery-charging',
    'battery-full',
    'battery-low',
    'battery-medium',
    'battery-warning',
    'battery',
    'beaker',
    'bean-off',
    'bean',
    'bed-double',
    'bed-single',
    'bed',
    'beef',
    'beer-off',
    'beer',
    'bell-dot',
    'bell-electric',
    'bell-minus',
    'bell-off',
    'bell-plus',
    'bell-ring',
    'bell',
    'between-horizontal-end',
    'between-horizontal-start',
    'between-vertical-end',
    'between-vertical-start',
    'biceps-flexed',
    'bike',
    'binary',
    'binoculars',
    'biohazard',
    'bird',
    'bitcoin',
    'blend',
    'blinds',
    'blocks',
    'bluetooth-connected',
    'bluetooth-off',
    'bluetooth-searching',
    'bluetooth',
    'bold',
    'bolt',
    'bomb',
    'bone',
    'book-a',
    'book-audio',
    'book-check',
    'book-copy',
    'book-dashed',
    'book-down',
    'book-headphones',
    'book-heart',
    'book-image',
    'book-key',
    'book-lock',
    'book-marked',
    'book-minus',
    'book-open-check',
    'book-open-text',
    'book-open',
    'book-plus',
    'book-text',
    'book-type',
    'book-up-2',
    'book-up',
    'book-user',
    'book-x',
    'book',
    'bookmark-check',
    'bookmark-minus',
    'bookmark-plus',
    'bookmark-x',
    'bookmark',
    'boom-box',
    'bot-message-square',
    'bot-off',
    'bot',
    'box',
    'boxes',
    'braces',
    'brackets',
    'brain-circuit',
    'brain-cog',
    'brain',
    'brick-wall',
    'briefcase-business',
    'briefcase-conveyor-belt',
    'briefcase-medical',
    'briefcase',
    'bring-to-front',
    'brush',
    'bug-off',
    'bug-play',
    'bug',
    'building-2',
    'building',
    'bus-front',
    'bus',
    'cable-car',
    'cable',
    'cake-slice',
    'cake',
    'calculator',
    'calendar-1',
    'calendar-arrow-down',
    'calendar-arrow-up',
    'calendar-check-2',
    'calendar-check',
    'calendar-clock',
    'calendar-cog',
    'calendar-days',
    'calendar-fold',
    'calendar-heart',
    'calendar-minus-2',
    'calendar-minus',
    'calendar-off',
    'calendar-plus-2',
    'calendar-plus',
    'calendar-range',
    'calendar-search',
    'calendar-sync',
    'calendar-x-2',
    'calendar-x',
    'calendar',
    'camera-off',
    'camera',
    'candy-cane',
    'candy-off',
    'candy',
    'cannabis',
    'captions-off',
    'captions',
    'car-front',
    'car-taxi-front',
    'car',
    'caravan',
    'carrot',
    'case-lower',
    'case-sensitive',
    'case-upper',
    'cassette-tape',
    'cast',
    'castle',
    'cat',
    'cctv',
    'chart-area',
    'chart-bar-big',
    'chart-bar-decreasing',
    'chart-bar-increasing',
    'chart-bar-stacked',
    'chart-bar',
    'chart-candlestick',
    'chart-column-big',
    'chart-column-decreasing',
    'chart-column-increasing',
    'chart-column-stacked',
    'chart-column',
    'chart-gantt',
    'chart-line',
    'chart-network',
    'chart-no-axes-column-decreasing',
    'chart-no-axes-column-increasing',
    'chart-no-axes-column',
    'chart-no-axes-combined',
    'chart-no-axes-gantt',
    'chart-pie',
    'chart-scatter',
    'chart-spline',
    'check-check',
    'check',
    'chef-hat',
    'cherry',
    'chevron-down',
    'chevron-first',
    'chevron-last',
    'chevron-left',
    'chevron-right',
    'chevron-up',
    'chevrons-down-up',
    'chevrons-down',
    'chevrons-left-right-ellipsis',
    'chevrons-left-right',
    'chevrons-left',
    'chevrons-right-left',
    'chevrons-right',
    'chevrons-up-down',
    'chevrons-up',
    'chrome',
    'church',
    'cigarette-off',
    'cigarette',
    'circle-alert',
    'circle-arrow-down',
    'circle-arrow-left',
    'circle-arrow-out-down-left',
    'circle-arrow-out-down-right',
    'circle-arrow-out-up-left',
    'circle-arrow-out-up-right',
    'circle-arrow-right',
    'circle-arrow-up',
    'circle-check-big',
    'circle-check',
    'circle-chevron-down',
    'circle-chevron-left',
    'circle-chevron-right',
    'circle-chevron-up',
    'circle-dashed',
    'circle-divide',
    'circle-dollar-sign',
    'circle-dot-dashed',
    'circle-dot',
    'circle-ellipsis',
    'circle-equal',
    'circle-fading-arrow-up',
    'circle-fading-plus',
    'circle-gauge',
    'circle-help',
    'circle-minus',
    'circle-off',
    'circle-parking-off',
    'circle-parking',
    'circle-pause',
    'circle-percent',
    'circle-play',
    'circle-plus',
    'circle-power',
    'circle-slash-2',
    'circle-slash',
    'circle-stop',
    'circle-user-round',
    'circle-user',
    'circle-x',
    'circle',
    'circuit-board',
    'citrus',
    'clapperboard',
    'clipboard-check',
    'clipboard-copy',
    'clipboard-list',
    'clipboard-minus',
    'clipboard-paste',
    'clipboard-pen-line',
    'clipboard-pen',
    'clipboard-plus',
    'clipboard-type',
    'clipboard-x',
    'clipboard',
    'clock-1',
    'clock-10',
    'clock-11',
    'clock-12',
    'clock-2',
    'clock-3',
    'clock-4',
    'clock-5',
    'clock-6',
    'clock-7',
    'clock-8',
    'clock-9',
    'clock-alert',
    'clock-arrow-down',
    'clock-arrow-up',
    'clock',
    'cloud-alert',
    'cloud-cog',
    'cloud-download',
    'cloud-drizzle',
    'cloud-fog',
    'cloud-hail',
    'cloud-lightning',
    'cloud-moon-rain',
    'cloud-moon',
    'cloud-off',
    'cloud-rain-wind',
    'cloud-rain',
    'cloud-snow',
    'cloud-sun-rain',
    'cloud-sun',
    'cloud-upload',
    'cloud',
    'cloudy',
    'clover',
    'club',
    'code-xml',
    'codepen',
    'codesandbox',
    'coffee',
    'cog',
    'coins',
    'columns-2',
    'columns-3',
    'columns-4',
    'combine',
    'command',
    'compass',
    'component',
    'computer',
    'concierge-bell',
    'cone',
    'construction',
    'contact-round',
    'contact',
    'container',
    'contrast',
    'cookie',
    'cooking-pot',
    'copy-check',
    'copy-minus',
    'copy-plus',
    'copy-slash',
    'copy-x',
    'copy',
    'copyleft',
    'copyright',
    'corner-down-left',
    'corner-down-right',
    'corner-left-down',
    'corner-left-up',
    'corner-right-down',
    'corner-right-up',
    'corner-up-left',
    'corner-up-right',
    'cpu',
    'creative-commons',
    'credit-card',
    'croissant',
    'crop',
    'cross',
    'crosshair',
    'crown',
    'cuboid',
    'cup-soda',
    'currency',
    'cylinder',
    'dam',
    'database-backup',
    'database-zap',
    'database',
    'delete',
    'dessert',
    'diameter',
    'diamond-minus',
    'diamond-percent',
    'diamond-plus',
    'diamond',
    'dice-1',
    'dice-2',
    'dice-3',
    'dice-4',
    'dice-5',
    'dice-6',
    'dices',
    'diff',
    'disc-2',
    'disc-3',
    'disc-album',
    'disc',
    'divide',
    'dna-off',
    'dna',
    'dock',
    'dog',
    'dollar-sign',
    'donut',
    'door-closed',
    'door-open',
    'dot',
    'download',
    'drafting-compass',
    'drama',
    'dribbble',
    'drill',
    'droplet',
    'droplets',
    'drum',
    'drumstick',
    'dumbbell',
    'ear-off',
    'ear',
    'earth-lock',
    'earth',
    'eclipse',
    'egg-fried',
    'egg-off',
    'egg',
    'ellipsis-vertical',
    'ellipsis',
    'equal-approximately',
    'equal-not',
    'equal',
    'eraser',
    'ethernet-port',
    'euro',
    'expand',
    'external-link',
    'eye-closed',
    'eye-off',
    'eye',
    'facebook',
    'factory',
    'fan',
    'fast-forward',
    'feather',
    'fence',
    'ferris-wheel',
    'figma',
    'file-archive',
    'file-audio-2',
    'file-audio',
    'file-axis-3d',
    'file-badge-2',
    'file-badge',
    'file-box',
    'file-chart-column-increasing',
    'file-chart-column',
    'file-chart-line',
    'file-chart-pie',
    'file-check-2',
    'file-check',
    'file-clock',
    'file-code-2',
    'file-code',
    'file-cog',
    'file-diff',
    'file-digit',
    'file-down',
    'file-heart',
    'file-image',
    'file-input',
    'file-json-2',
    'file-json',
    'file-key-2',
    'file-key',
    'file-lock-2',
    'file-lock',
    'file-minus-2',
    'file-minus',
    'file-music',
    'file-output',
    'file-pen-line',
    'file-pen',
    'file-plus-2',
    'file-plus',
    'file-question',
    'file-scan',
    'file-search-2',
    'file-search',
    'file-sliders',
    'file-spreadsheet',
    'file-stack',
    'file-symlink',
    'file-terminal',
    'file-text',
    'file-type-2',
    'file-type',
    'file-up',
    'file-user',
    'file-video-2',
    'file-video',
    'file-volume-2',
    'file-volume',
    'file-warning',
    'file-x-2',
    'file-x',
    'file',
    'files',
    'film',
    'filter-x',
    'filter',
    'fingerprint',
    'fire-extinguisher',
    'fish-off',
    'fish-symbol',
    'fish',
    'flag-off',
    'flag-triangle-left',
    'flag-triangle-right',
    'flag',
    'flame-kindling',
    'flame',
    'flashlight-off',
    'flashlight',
    'flask-conical-off',
    'flask-conical',
    'flask-round',
    'flip-horizontal-2',
    'flip-horizontal',
    'flip-vertical-2',
    'flip-vertical',
    'flower-2',
    'flower',
    'focus',
    'fold-horizontal',
    'fold-vertical',
    'folder-archive',
    'folder-check',
    'folder-clock',
    'folder-closed',
    'folder-code',
    'folder-cog',
    'folder-dot',
    'folder-down',
    'folder-git-2',
    'folder-git',
    'folder-heart',
    'folder-input',
    'folder-kanban',
    'folder-key',
    'folder-lock',
    'folder-minus',
    'folder-open-dot',
    'folder-open',
    'folder-output',
    'folder-pen',
    'folder-plus',
    'folder-root',
    'folder-search-2',
    'folder-search',
    'folder-symlink',
    'folder-sync',
    'folder-tree',
    'folder-up',
    'folder-x',
    'folder',
    'folders',
    'footprints',
    'forklift',
    'forward',
    'frame',
    'framer',
    'frown',
    'fuel',
    'fullscreen',
    'gallery-horizontal-end',
    'gallery-horizontal',
    'gallery-thumbnails',
    'gallery-vertical-end',
    'gallery-vertical',
    'gamepad-2',
    'gamepad',
    'gauge',
    'gavel',
    'gem',
    'ghost',
    'gift',
    'git-branch-plus',
    'git-branch',
    'git-commit-horizontal',
    'git-commit-vertical',
    'git-compare-arrows',
    'git-compare',
    'git-fork',
    'git-graph',
    'git-merge',
    'git-pull-request-arrow',
    'git-pull-request-closed',
    'git-pull-request-create-arrow',
    'git-pull-request-create',
    'git-pull-request-draft',
    'git-pull-request',
    'github',
    'gitlab',
    'glass-water',
    'glasses',
    'globe-lock',
    'globe',
    'goal',
    'grab',
    'graduation-cap',
    'grape',
    'grid-2x2-check',
    'grid-2x2-plus',
    'grid-2x2-x',
    'grid-2x2',
    'grid-3x3',
    'grip-horizontal',
    'grip-vertical',
    'grip',
    'group',
    'guitar',
    'ham',
    'hammer',
    'hand-coins',
    'hand-heart',
    'hand-helping',
    'hand-metal',
    'hand-platter',
    'hand',
    'handshake',
    'hard-drive-download',
    'hard-drive-upload',
    'hard-drive',
    'hard-hat',
    'hash',
    'haze',
    'hdmi-port',
    'heading-1',
    'heading-2',
    'heading-3',
    'heading-4',
    'heading-5',
    'heading-6',
    'heading',
    'headphone-off',
    'headphones',
    'headset',
    'heart-crack',
    'heart-handshake',
    'heart-off',
    'heart-pulse',
    'heart',
    'heater',
    'hexagon',
    'highlighter',
    'history',
    'hop-off',
    'hop',
    'hospital',
    'hotel',
    'hourglass',
    'house-plug',
    'house-plus',
    'house',
    'ice-cream-bowl',
    'ice-cream-cone',
    'id-card',
    'image-down',
    'image-minus',
    'image-off',
    'image-play',
    'image-plus',
    'image-up',
    'image-upscale',
    'image',
    'images',
    'import',
    'inbox',
    'indent-decrease',
    'indent-increase',
    'indian-rupee',
    'infinity',
    'info',
    'inspection-panel',
    'instagram',
    'italic',
    'iteration-ccw',
    'iteration-cw',
    'japanese-yen',
    'joystick',
    'kanban',
    'key-round',
    'key-square',
    'key',
    'keyboard-music',
    'keyboard-off',
    'keyboard',
    'lamp-ceiling',
    'lamp-desk',
    'lamp-floor',
    'lamp-wall-down',
    'lamp-wall-up',
    'lamp',
    'land-plot',
    'landmark',
    'languages',
    'laptop-minimal-check',
    'laptop-minimal',
    'laptop',
    'lasso-select',
    'lasso',
    'laugh',
    'layers-2',
    'layers-3',
    'layers',
    'layout-dashboard',
    'layout-grid',
    'layout-list',
    'layout-panel-left',
    'layout-panel-top',
    'layout-template',
    'leaf',
    'leafy-green',
    'lectern',
    'letter-text',
    'library-big',
    'library',
    'life-buoy',
    'ligature',
    'lightbulb-off',
    'lightbulb',
    'link-2-off',
    'link-2',
    'link',
    'linkedin',
    'list-check',
    'list-checks',
    'list-collapse',
    'list-end',
    'list-filter',
    'list-minus',
    'list-music',
    'list-ordered',
    'list-plus',
    'list-restart',
    'list-start',
    'list-todo',
    'list-tree',
    'list-video',
    'list-x',
    'list',
    'loader-circle',
    'loader-pinwheel',
    'loader',
    'locate-fixed',
    'locate-off',
    'locate',
    'lock-keyhole-open',
    'lock-keyhole',
    'lock-open',
    'lock',
    'log-in',
    'log-out',
    'logs',
    'lollipop',
    'luggage',
    'magnet',
    'mail-check',
    'mail-minus',
    'mail-open',
    'mail-plus',
    'mail-question',
    'mail-search',
    'mail-warning',
    'mail-x',
    'mail',
    'mailbox',
    'mails',
    'map-pin-check-inside',
    'map-pin-check',
    'map-pin-house',
    'map-pin-minus-inside',
    'map-pin-minus',
    'map-pin-off',
    'map-pin-plus-inside',
    'map-pin-plus',
    'map-pin-x-inside',
    'map-pin-x',
    'map-pin',
    'map-pinned',
    'map',
    'martini',
    'maximize-2',
    'maximize',
    'medal',
    'megaphone-off',
    'megaphone',
    'meh',
    'memory-stick',
    'menu',
    'merge',
    'message-circle-code',
    'message-circle-dashed',
    'message-circle-heart',
    'message-circle-more',
    'message-circle-off',
    'message-circle-plus',
    'message-circle-question',
    'message-circle-reply',
    'message-circle-warning',
    'message-circle-x',
    'message-circle',
    'message-square-code',
    'message-square-dashed',
    'message-square-diff',
    'message-square-dot',
    'message-square-heart',
    'message-square-lock',
    'message-square-more',
    'message-square-off',
    'message-square-plus',
    'message-square-quote',
    'message-square-reply',
    'message-square-share',
    'message-square-text',
    'message-square-warning',
    'message-square-x',
    'message-square',
    'messages-square',
    'mic-off',
    'mic-vocal',
    'mic',
    'microchip',
    'microscope',
    'microwave',
    'milestone',
    'milk-off',
    'milk',
    'minimize-2',
    'minimize',
    'minus',
    'monitor-check',
    'monitor-cog',
    'monitor-dot',
    'monitor-down',
    'monitor-off',
    'monitor-pause',
    'monitor-play',
    'monitor-smartphone',
    'monitor-speaker',
    'monitor-stop',
    'monitor-up',
    'monitor-x',
    'monitor',
    'moon-star',
    'moon',
    'mountain-snow',
    'mountain',
    'mouse-off',
    'mouse-pointer-2',
    'mouse-pointer-ban',
    'mouse-pointer-click',
    'mouse-pointer',
    'mouse',
    'move-3d',
    'move-diagonal-2',
    'move-diagonal',
    'move-down-left',
    'move-down-right',
    'move-down',
    'move-horizontal',
    'move-left',
    'move-right',
    'move-up-left',
    'move-up-right',
    'move-up',
    'move-vertical',
    'move',
    'music-2',
    'music-3',
    'music-4',
    'music',
    'navigation-2-off',
    'navigation-2',
    'navigation-off',
    'navigation',
    'network',
    'newspaper',
    'nfc',
    'notebook-pen',
    'notebook-tabs',
    'notebook-text',
    'notebook',
    'notepad-text-dashed',
    'notepad-text',
    'nut-off',
    'nut',
    'octagon-alert',
    'octagon-minus',
    'octagon-pause',
    'octagon-x',
    'octagon',
    'omega',
    'option',
    'orbit',
    'origami',
    'package-2',
    'package-check',
    'package-minus',
    'package-open',
    'package-plus',
    'package-search',
    'package-x',
    'package',
    'paint-bucket',
    'paint-roller',
    'paintbrush-vertical',
    'paintbrush',
    'palette',
    'panel-bottom-close',
    'panel-bottom-dashed',
    'panel-bottom-open',
    'panel-bottom',
    'panel-left-close',
    'panel-left-dashed',
    'panel-left-open',
    'panel-left',
    'panel-right-close',
    'panel-right-dashed',
    'panel-right-open',
    'panel-right',
    'panel-top-close',
    'panel-top-dashed',
    'panel-top-open',
    'panel-top',
    'panels-left-bottom',
    'panels-right-bottom',
    'panels-top-left',
    'paperclip',
    'parentheses',
    'parking-meter',
    'party-popper',
    'pause',
    'paw-print',
    'pc-case',
    'pen-line',
    'pen-off',
    'pen-tool',
    'pen',
    'pencil-line',
    'pencil-off',
    'pencil-ruler',
    'pencil',
    'pentagon',
    'percent',
    'person-standing',
    'philippine-peso',
    'phone-call',
    'phone-forwarded',
    'phone-incoming',
    'phone-missed',
    'phone-off',
    'phone-outgoing',
    'phone',
    'pi',
    'piano',
    'pickaxe',
    'picture-in-picture-2',
    'picture-in-picture',
    'piggy-bank',
    'pilcrow-left',
    'pilcrow-right',
    'pilcrow',
    'pill-bottle',
    'pill',
    'pin-off',
    'pin',
    'pipette',
    'pizza',
    'plane-landing',
    'plane-takeoff',
    'plane',
    'play',
    'plug-2',
    'plug-zap',
    'plug',
    'plus',
    'pocket-knife',
    'pocket',
    'podcast',
    'pointer-off',
    'pointer',
    'popcorn',
    'popsicle',
    'pound-sterling',
    'power-off',
    'power',
    'presentation',
    'printer-check',
    'printer',
    'projector',
    'proportions',
    'puzzle',
    'pyramid',
    'qr-code',
    'quote',
    'rabbit',
    'radar',
    'radiation',
    'radical',
    'radio-receiver',
    'radio-tower',
    'radio',
    'radius',
    'rail-symbol',
    'rainbow',
    'rat',
    'ratio',
    'receipt-cent',
    'receipt-euro',
    'receipt-indian-rupee',
    'receipt-japanese-yen',
    'receipt-pound-sterling',
    'receipt-russian-ruble',
    'receipt-swiss-franc',
    'receipt-text',
    'receipt',
    'rectangle-ellipsis',
    'rectangle-horizontal',
    'rectangle-vertical',
    'recycle',
    'redo-2',
    'redo-dot',
    'redo',
    'refresh-ccw-dot',
    'refresh-ccw',
    'refresh-cw-off',
    'refresh-cw',
    'refrigerator',
    'regex',
    'remove-formatting',
    'repeat-1',
    'repeat-2',
    'repeat',
    'replace-all',
    'replace',
    'reply-all',
    'reply',
    'rewind',
    'ribbon',
    'rocket',
    'rocking-chair',
    'roller-coaster',
    'rotate-3d',
    'rotate-ccw-square',
    'rotate-ccw',
    'rotate-cw-square',
    'rotate-cw',
    'route-off',
    'route',
    'router',
    'rows-2',
    'rows-3',
    'rows-4',
    'rss',
    'ruler',
    'russian-ruble',
    'sailboat',
    'salad',
    'sandwich',
    'satellite-dish',
    'satellite',
    'save-all',
    'save-off',
    'save',
    'scale-3d',
    'scale',
    'scaling',
    'scan-barcode',
    'scan-eye',
    'scan-face',
    'scan-line',
    'scan-qr-code',
    'scan-search',
    'scan-text',
    'scan',
    'school',
    'scissors-line-dashed',
    'scissors',
    'screen-share-off',
    'screen-share',
    'scroll-text',
    'scroll',
    'search-check',
    'search-code',
    'search-slash',
    'search-x',
    'search',
    'section',
    'send-horizontal',
    'send-to-back',
    'send',
    'separator-horizontal',
    'separator-vertical',
    'server-cog',
    'server-crash',
    'server-off',
    'server',
    'settings-2',
    'settings',
    'shapes',
    'share-2',
    'share',
    'sheet',
    'shell',
    'shield-alert',
    'shield-ban',
    'shield-check',
    'shield-ellipsis',
    'shield-half',
    'shield-minus',
    'shield-off',
    'shield-plus',
    'shield-question',
    'shield-x',
    'shield',
    'ship-wheel',
    'ship',
    'shirt',
    'shopping-bag',
    'shopping-basket',
    'shopping-cart',
    'shovel',
    'shower-head',
    'shrink',
    'shrub',
    'shuffle',
    'sigma',
    'signal-high',
    'signal-low',
    'signal-medium',
    'signal-zero',
    'signal',
    'signature',
    'signpost-big',
    'signpost',
    'siren',
    'skip-back',
    'skip-forward',
    'skull',
    'slack',
    'slash',
    'slice',
    'sliders-horizontal',
    'sliders-vertical',
    'smartphone-charging',
    'smartphone-nfc',
    'smartphone',
    'smile-plus',
    'smile',
    'snail',
    'snowflake',
    'sofa',
    'soup',
    'space',
    'spade',
    'sparkle',
    'sparkles',
    'speaker',
    'speech',
    'spell-check-2',
    'spell-check',
    'spline',
    'split',
    'spray-can',
    'sprout',
    'square-activity',
    'square-arrow-down-left',
    'square-arrow-down-right',
    'square-arrow-down',
    'square-arrow-left',
    'square-arrow-out-down-left',
    'square-arrow-out-down-right',
    'square-arrow-out-up-left',
    'square-arrow-out-up-right',
    'square-arrow-right',
    'square-arrow-up-left',
    'square-arrow-up-right',
    'square-arrow-up',
    'square-asterisk',
    'square-bottom-dashed-scissors',
    'square-chart-gantt',
    'square-check-big',
    'square-check',
    'square-chevron-down',
    'square-chevron-left',
    'square-chevron-right',
    'square-chevron-up',
    'square-code',
    'square-dashed-bottom-code',
    'square-dashed-bottom',
    'square-dashed-kanban',
    'square-dashed-mouse-pointer',
    'square-dashed',
    'square-divide',
    'square-dot',
    'square-equal',
    'square-function',
    'square-kanban',
    'square-library',
    'square-m',
    'square-menu',
    'square-minus',
    'square-mouse-pointer',
    'square-parking-off',
    'square-parking',
    'square-pen',
    'square-percent',
    'square-pi',
    'square-pilcrow',
    'square-play',
    'square-plus',
    'square-power',
    'square-radical',
    'square-scissors',
    'square-sigma',
    'square-slash',
    'square-split-horizontal',
    'square-split-vertical',
    'square-square',
    'square-stack',
    'square-terminal',
    'square-user-round',
    'square-user',
    'square-x',
    'square',
    'squircle',
    'squirrel',
    'stamp',
    'star-half',
    'star-off',
    'star',
    'step-back',
    'step-forward',
    'stethoscope',
    'sticker',
    'sticky-note',
    'store',
    'stretch-horizontal',
    'stretch-vertical',
    'strikethrough',
    'subscript',
    'sun-dim',
    'sun-medium',
    'sun-moon',
    'sun-snow',
    'sun',
    'sunrise',
    'sunset',
    'superscript',
    'swatch-book',
    'swiss-franc',
    'switch-camera',
    'sword',
    'swords',
    'syringe',
    'table-2',
    'table-cells-merge',
    'table-cells-split',
    'table-columns-split',
    'table-of-contents',
    'table-properties',
    'table-rows-split',
    'table',
    'tablet-smartphone',
    'tablet',
    'tablets',
    'tag',
    'tags',
    'tally-1',
    'tally-2',
    'tally-3',
    'tally-4',
    'tally-5',
    'tangent',
    'target',
    'telescope',
    'tent-tree',
    'tent',
    'terminal',
    'test-tube-diagonal',
    'test-tube',
    'test-tubes',
    'text-cursor-input',
    'text-cursor',
    'text-quote',
    'text-search',
    'text-select',
    'text',
    'theater',
    'thermometer-snowflake',
    'thermometer-sun',
    'thermometer',
    'thumbs-down',
    'thumbs-up',
    'ticket-check',
    'ticket-minus',
    'ticket-percent',
    'ticket-plus',
    'ticket-slash',
    'ticket-x',
    'ticket',
    'tickets-plane',
    'tickets',
    'timer-off',
    'timer-reset',
    'timer',
    'toggle-left',
    'toggle-right',
    'toilet',
    'tornado',
    'torus',
    'touchpad-off',
    'touchpad',
    'tower-control',
    'toy-brick',
    'tractor',
    'traffic-cone',
    'train-front-tunnel',
    'train-front',
    'train-track',
    'tram-front',
    'trash-2',
    'trash',
    'tree-deciduous',
    'tree-palm',
    'tree-pine',
    'trees',
    'trello',
    'trending-down',
    'trending-up-down',
    'trending-up',
    'triangle-alert',
    'triangle-right',
    'triangle',
    'trophy',
    'truck',
    'turtle',
    'tv-minimal-play',
    'tv-minimal',
    'tv',
    'twitch',
    'twitter',
    'type-outline',
    'type',
    'umbrella-off',
    'umbrella',
    'underline',
    'undo-2',
    'undo-dot',
    'undo',
    'unfold-horizontal',
    'unfold-vertical',
    'ungroup',
    'university',
    'unlink-2',
    'unlink',
    'unplug',
    'upload',
    'usb',
    'user-check',
    'user-cog',
    'user-minus',
    'user-pen',
    'user-plus',
    'user-round-check',
    'user-round-cog',
    'user-round-minus',
    'user-round-pen',
    'user-round-plus',
    'user-round-search',
    'user-round-x',
    'user-round',
    'user-search',
    'user-x',
    'user',
    'users-round',
    'users',
    'utensils-crossed',
    'utensils',
    'utility-pole',
    'variable',
    'vault',
    'vegan',
    'venetian-mask',
    'vibrate-off',
    'vibrate',
    'video-off',
    'video',
    'videotape',
    'view',
    'voicemail',
    'volleyball',
    'volume-1',
    'volume-2',
    'volume-off',
    'volume-x',
    'volume',
    'vote',
    'wallet-cards',
    'wallet-minimal',
    'wallet',
    'wallpaper',
    'wand-sparkles',
    'wand',
    'warehouse',
    'washing-machine',
    'watch',
    'waves',
    'waypoints',
    'webcam',
    'webhook-off',
    'webhook',
    'weight',
    'wheat-off',
    'wheat',
    'whole-word',
    'wifi-high',
    'wifi-low',
    'wifi-off',
    'wifi-zero',
    'wifi',
    'wind-arrow-down',
    'wind',
    'wine-off',
    'wine',
    'workflow',
    'worm',
    'wrap-text',
    'wrench',
    'x',
    'youtube',
    'zap-off',
    'zap',
    'zoom-in',
    'zoom-out',
]