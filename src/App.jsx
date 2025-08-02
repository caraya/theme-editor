import React, { useState, useEffect, useCallback } from 'react';
import './index.css'; // Import your main CSS file
// --- Helper Functions & Initial Data ---

/**
 * Formats a string into a CSS-friendly class name.
 * @param {string} name The string to format.
 * @returns {string}
 */
const toCssClass = (name) => `theme-${name.toLowerCase().replace(/\s+/g, '-')}`;

const initialPreviewHtml = `
<div class="max-w-2xl mx-auto">
    <h1 class="text-4xl font-bold mb-2" style="color: var(--primary-text-color);">Live Preview</h1>
    <p class="text-lg mb-6" style="color: var(--secondary-text-color);">
      This area updates in real-time as you edit the theme styles on the left.
    </p>

    <div class="p-6 rounded-lg mb-6" style="background-color: var(--secondary-bg-color); border: 1px solid var(--border-color); border-radius: var(--border-radius); box-shadow: var(--card-shadow); transition: all var(--animation-duration); background-image: linear-gradient(var(--gradient-angle), var(--primary-bg-color), var(--secondary-bg-color));">
      <h2 class="text-2xl font-semibold mb-3" style="color: var(--primary-text-color);">Sample Card</h2>
      <p class="mb-4" style="color: var(--secondary-text-color);">
        This is a sample card component to demonstrate the theme. It uses secondary background and text colors.
        You can also check out this <a href="#" style="color: var(--accent-color); font-weight: 500;">awesome link</a>.
      </p>
      <button style="background-color: var(--accent-color); color: var(--primary-bg-color); padding: 10px 20px; border: none; border-radius: var(--border-radius); font-weight: bold; cursor: pointer; transition: transform var(--animation-duration);">
        Accent Button
      </button>
    </div>
</div>
`;

// Rules are now objects with labels, types, and groups for a better UI
const initialData = {
  rules: [
    { id: '--primary-bg-color', label: 'Primary Background', type: 'color', group: 'Colors' },
    { id: '--secondary-bg-color', label: 'Card/Element Background', type: 'color', group: 'Colors' },
    { id: '--gradient-angle', label: 'Gradient Angle', type: 'angle', group: 'Colors' },
    { id: '--primary-text-color', label: 'Primary Text', type: 'color', group: 'Colors' },
    { id: '--secondary-text-color', label: 'Secondary Text', type: 'color', group: 'Colors' },
    { id: '--accent-color', label: 'Accent / Link Color', type: 'color', group: 'Colors' },
    { id: '--border-color', label: 'Border Color', type: 'color', group: 'Borders & Spacing' },
    { id: '--border-radius', label: 'Border Radius', type: 'dimension', group: 'Borders & Spacing' },
    { id: '--card-shadow', label: 'Card Shadow', type: 'text', group: 'Shadows' },
    { id: '--animation-duration', label: 'Animation Duration', type: 'duration', group: 'Animations' },
  ],
  themes: {
    'Light': {
      '--primary-bg-color': 'oklch(98% 0.01 270)',
      '--secondary-bg-color': 'oklch(100% 0 0)',
      '--gradient-angle': '90deg',
      '--primary-text-color': 'oklch(20% 0.01 270)',
      '--secondary-text-color': 'oklch(50% 0.01 270)',
      '--accent-color': 'oklch(55% 0.22 260)',
      '--border-color': 'oklch(90% 0.01 270)',
      '--border-radius': '12px',
      '--card-shadow': '0 4px 6px rgba(0,0,0,0.1)',
      '--animation-duration': '300ms',
    },
    'Dark': {
      '--primary-bg-color': 'oklch(15% 0 0)',
      '--secondary-bg-color': 'oklch(20% 0.01 270)',
      '--gradient-angle': '90deg',
      '--primary-text-color': 'oklch(90% 0.01 270)',
      '--secondary-text-color': 'oklch(65% 0.01 270)',
      '--accent-color': 'oklch(80% 0.25 180)',
      '--border-color': 'oklch(35% 0.01 270)',
      '--border-radius': '12px',
      '--card-shadow': '0 4px 8px rgba(0,0,0,0.4)',
      '--animation-duration': '300ms',
    },
    'Synthwave': {
      '--primary-bg-color': 'oklch(25% 0.15 280)',
      '--secondary-bg-color': 'oklch(15% 0.1 280)',
      '--gradient-angle': '145deg',
      '--primary-text-color': 'oklch(97% 0 0)',
      '--secondary-text-color': 'oklch(75% 0.25 325)',
      '--accent-color': 'oklch(85% 0.25 195)',
      '--border-color': 'oklch(75% 0.25 325)',
      '--border-radius': '8px',
      '--card-shadow': '0 0 15px oklch(85% 0.25 195 / 0.5)',
      '--animation-duration': '500ms',
    },
  },
};

// --- Type Definitions for JSDoc ---

/**
 * @typedef {object} Rule
 * @property {string} id
 * @property {string} label
 * @property {string} type
 * @property {string} group
 * @property {string=} placeholder
 */

/**
 * @typedef {Record<string, string>} Theme
 */

/**
 * @typedef {Record<string, Theme>} Themes
 */


// --- React Components ---

/**
 * @param {{ path: React.ReactNode; className?: string; }} props
 */
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    {path}
  </svg>
);

const ICONS = {
  add: <Icon path={<path d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1z" />} />,
  copy: <Icon path={<path d="M7 13a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-6zM3 3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3zm5 10a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H8zM5 3a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H5z" />} />,
  check: <Icon path={<path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />} />,
  upload: <Icon path={<path d="M13 10v6h-2v-6H8l4-4 4 4h-3zm-2 8H6v2h12v-2h-5z" />} />,
  reset: <Icon path={<path d="M12 4a8 8 0 0 0-8 8h2a6 6 0 1 1 6-6V4zm-2 5v5h5v-2h-3V9H10z" />} />,
  edit: <Icon path={<path d="M16.707 2.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-.39.242l-4 1a1 1 0 0 1-1.212-1.212l1-4a1 1 0 0 1 .242-.39l9-9zM18 6.414l-1.293-1.293-7.293 7.293 1.293 1.293 7.293-7.293zm-2.586-1.586L14 3.414 15.414 2 17 3.586 15.586 5zM4.414 17l-1 1 3 3 1-1-3-3z" />} />
};

/**
 * @param {{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg'; }} props
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeClass = size === 'lg' ? 'max-w-4xl' : 'max-w-md';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full ${sizeClass}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

/**
 * @param {{ rule: Rule; value: string; onChange: (id: string, value: string) => void; }} props
 */
const RuleEditor = ({ rule, value, onChange }) => {
    /**
     * @param {string} val
     * @param {string} defaultUnit
     */
    const parseUnitValue = (val, defaultUnit) => {
        if (typeof val !== 'string') return { num: 0, unit: defaultUnit };
        const num = parseFloat(val) || 0;
        const unitMatch = val.match(/[a-zA-Z%]+$/);
        const unit = unitMatch ? unitMatch[0] : defaultUnit;
        return { num, unit };
    };

    const renderInput = () => {
        switch (rule.type) {
            case 'color': {
                return (
                    <>
                        <div className="w-8 h-8 flex-shrink-0 rounded-md border border-gray-300 dark:border-gray-600" style={{ backgroundColor: value }}></div>
                        <input
                            type="text"
                            value={value || ''}
                            placeholder="e.g., oklch(55% 0.22 260)"
                            onChange={(e) => onChange(rule.id, e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                        />
                    </>
                );
            }
            case 'dimension':
            case 'duration':
            case 'angle': {
                let units = [];
                let defaultUnit = 'px';
                if (rule.type === 'dimension') {
                    units = ['px', 'rem', 'em', '%', 'vw', 'vh'];
                    defaultUnit = 'px';
                } else if (rule.type === 'duration') {
                    units = ['ms', 's'];
                    defaultUnit = 'ms';
                } else if (rule.type === 'angle') {
                    units = ['deg', 'rad', 'grad', 'turn'];
                    defaultUnit = 'deg';
                }
                const { num, unit } = parseUnitValue(value, defaultUnit);
                return (
                    <>
                        <input
                            type="number"
                            value={num}
                            onChange={(e) => onChange(rule.id, `${e.target.value}${unit}`)}
                            className="w-2/3 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                        />
                        <select
                            value={unit}
                            onChange={(e) => onChange(rule.id, `${num}${e.target.value}`)}
                            className="w-1/3 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                        >
                            {units.map(u => <option key={u}>{u}</option>)}
                        </select>
                    </>
                );
            }
            default: { // 'text' and any other type
                return (
                    <input
                        type="text"
                        value={value || ''}
                        placeholder={rule.placeholder || 'Enter value'}
                        onChange={(e) => onChange(rule.id, e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                    />
                );
            }
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{rule.label}</label>
            <div className="flex items-center space-x-2">
                {renderInput()}
            </div>
        </div>
    );
};


/**
 * @param {{ themes: Themes; rules: Rule[]; activeTheme: string; setActiveTheme: (theme: string) => void; onThemeUpdate: (ruleId: string, value: string) => void; onAddThemeClick: () => void; onAddRuleClick: () => void; onImportClick: () => void; onResetClick: () => void; onEditHtmlClick: () => void; }} props
 */
const ControlsPanel = ({ themes, rules, activeTheme, setActiveTheme, onThemeUpdate, onAddThemeClick, onAddRuleClick, onImportClick, onResetClick, onEditHtmlClick }) => {
  const handleRuleChange = (ruleId, value) => {
    onThemeUpdate(ruleId, value);
  };
  
  const groupedRules = rules.reduce((acc, rule) => {
    const group = rule.group || 'General';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(rule);
    return acc;
  }, {});

  return (
    <div className="md:w-1/3 w-full p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto h-full border-r border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Theme Editor</h2>
        <div className="flex items-center gap-2">
            <button onClick={onEditHtmlClick} title="Edit Preview HTML" className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:underline p-2 bg-green-50 dark:bg-green-900/50 rounded-lg">
                {ICONS.edit}
            </button>
            <button onClick={onImportClick} title="Import from file" className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                {ICONS.upload}
            </button>
            <button onClick={onResetClick} title="Reset to defaults" className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline p-2 bg-red-50 dark:bg-red-900/50 rounded-lg">
                {ICONS.reset}
            </button>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Select a Theme to Edit</label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(themes).map(themeName => (
            <button
              key={themeName}
              onClick={() => setActiveTheme(themeName)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTheme === themeName
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-600'
              }`}
            >
              {themeName}
            </button>
          ))}
          <button onClick={onAddThemeClick} className="p-2 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600 rounded-lg transition-colors">{ICONS.add}</button>
        </div>
      </div>
      
      <div className="mb-6">
          <button onClick={onAddRuleClick} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline px-3 py-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
              {ICONS.add}
              Add New Style Rule
          </button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedRules).map(([groupName, rulesInGroup]) => (
          <div key={groupName}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">{groupName}</h3>
            <div className="space-y-4">
              {rulesInGroup.map(rule => (
                <RuleEditor
                  key={rule.id}
                  rule={rule}
                  value={themes[activeTheme]?.[rule.id] || ''}
                  onChange={handleRuleChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * @param {{ activeTheme: string; htmlContent: string; }} props
 */
const PreviewPanel = ({ activeTheme, htmlContent }) => {
  const themeClass = toCssClass(activeTheme);
  return (
    <div id="preview-panel" className={`md:w-2/3 w-full p-6 md:p-8 overflow-y-auto h-full transition-all duration-300 ${themeClass}`} style={{
        backgroundColor: 'var(--primary-bg-color)',
        color: 'var(--primary-text-color)',
        transitionDuration: 'var(--animation-duration)'
    }}>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

/**
 * @param {{ css: string; onCopy: (text: string) => void; }} props
 */
const CssOutput = ({ css, onCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy(css);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full p-4 md:p-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Generated CSS</h3>
                <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    {copied ? <>{ICONS.check} Copied!</> : <>{ICONS.copy} Copy</>}
                </button>
            </div>
            <pre className="w-full p-4 bg-gray-800 text-white rounded-lg overflow-x-auto text-sm">
                <code>{css}</code>
            </pre>
        </div>
    );
};


// Main App Component
export default function App() {
  const THEMES_STORAGE_KEY = 'theme-editor-themes';
  const RULES_STORAGE_KEY = 'theme-editor-rules';
  const PREVIEW_HTML_STORAGE_KEY = 'theme-editor-preview-html';

  const [themes, setThemes] = useState(() => {
    try {
        const savedThemes = localStorage.getItem(THEMES_STORAGE_KEY);
        return savedThemes ? JSON.parse(savedThemes) : initialData.themes;
    } catch (e) {
        console.error("Failed to parse themes from localStorage", e);
        return initialData.themes;
    }
  });

  const [rules, setRules] = useState(() => {
    try {
        const savedRules = localStorage.getItem(RULES_STORAGE_KEY);
        return savedRules ? JSON.parse(savedRules) : initialData.rules;
    } catch (e) {
        console.error("Failed to parse rules from localStorage", e);
        return initialData.rules;
    }
  });
  
  const [previewHtml, setPreviewHtml] = useState(() => {
    try {
        const savedHtml = localStorage.getItem(PREVIEW_HTML_STORAGE_KEY);
        return savedHtml ? savedHtml : initialPreviewHtml;
    } catch (e) {
        console.error("Failed to parse HTML from localStorage", e);
        return initialPreviewHtml;
    }
  });

  const [activeTheme, setActiveTheme] = useState(Object.keys(themes)[0] || '');
  const [generatedCss, setGeneratedCss] = useState('');
  const [isAddThemeModalOpen, setAddThemeModalOpen] = useState(false);
  const [isAddRuleModalOpen, setAddRuleModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isEditHtmlModalOpen, setEditHtmlModalOpen] = useState(false);

  // Effect to save to localStorage whenever data changes
  useEffect(() => {
    try {
        localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(themes));
        localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
        localStorage.setItem(PREVIEW_HTML_STORAGE_KEY, previewHtml);
    } catch (e) {
        console.error("Failed to save to localStorage", e);
    }
  }, [themes, rules, previewHtml]);

  const generateCssString = useCallback(() => {
    let cssString = '';
    const themeNames = Object.keys(themes);
    if (themeNames.length === 0) return '';
    
    const defaultThemeName = themeNames[0];
    cssString += `:root {\n`;
    rules.forEach(rule => {
      cssString += `  ${rule.id}: ${themes[defaultThemeName]?.[rule.id] || ''};\n`;
    });
    cssString += `}\n\n`;

    themeNames.slice(1).forEach(themeName => {
      const themeClass = toCssClass(themeName);
      cssString += `.${themeClass} {\n`;
      rules.forEach(rule => {
        cssString += `  ${rule.id}: ${themes[themeName]?.[rule.id] || ''};\n`;
      });
      cssString += `}\n\n`;
    });
    
    return cssString;
  }, [themes, rules]);

  useEffect(() => {
    const css = generateCssString();
    setGeneratedCss(css);
    let styleTag = document.getElementById('theme-editor-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'theme-editor-styles';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = css;
  }, [themes, generateCssString]);

  const handleThemeUpdate = (ruleId, value) => {
    setThemes(prevThemes => ({
      ...prevThemes,
      [activeTheme]: {
        ...prevThemes[activeTheme],
        [ruleId]: value
      }
    }));
  };
  
  const handleAddTheme = (newThemeName) => {
      if (!newThemeName || themes[newThemeName]) {
        alert("Please enter a unique theme name.");
        return;
      }
      const firstTheme = themes[Object.keys(themes)[0]] || {};
      const newTheme = {...firstTheme};
      
      setThemes(prevThemes => ({
          ...prevThemes,
          [newThemeName]: newTheme
      }));
      setActiveTheme(newThemeName);
      setAddThemeModalOpen(false);
  };

  const handleAddRule = (partialRule) => {
    if (!partialRule.label || !partialRule.group) {
        alert("Please fill out all required fields.");
        return;
    }
    
    const id = `--${partialRule.label.toLowerCase().replace(/\s+/g, '-')}`;

    if (rules.some(rule => rule.id === id)) {
        alert(`A rule with the variable name ${id} already exists. Please choose a different label.`);
        return;
    }

    const newRule = {
        ...partialRule,
        id,
        placeholder: 'Enter value'
    };

    setRules(prevRules => [...prevRules, newRule]);
    setThemes(prevThemes => {
        const updatedThemes = {...prevThemes};
        for (const themeName in updatedThemes) {
            let defaultValue = '';
            if (newRule.type === 'color') defaultValue = '#cccccc';
            if (newRule.type === 'dimension') defaultValue = '12px';
            if (newRule.type === 'duration') defaultValue = '300ms';
            if (newRule.type === 'angle') defaultValue = '90deg';
            updatedThemes[themeName][newRule.id] = defaultValue;
        }
        return updatedThemes;
    });
    setAddRuleModalOpen(false);
  };

  const handleImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(/** @type {string} */ (event.target.result));
            
            let newRules = [...rules];
            let newThemes = {...themes};

            for (const themeName in importedData) {
                if (!newThemes[themeName]) {
                    newThemes[themeName] = {};
                }
                for (const tokenName in importedData[themeName]) {
                    newThemes[themeName][tokenName] = importedData[themeName][tokenName];

                    if (!newRules.some(rule => rule.id === tokenName)) {
                        const newRule = {
                            id: tokenName,
                            label: tokenName.replace('--', '').replace(/-/g, ' '),
                            type: 'text', // Default to text
                            group: 'Imported'
                        };
                        newRules.push(newRule);
                    }
                }
            }
            setRules(newRules);
            setThemes(newThemes);
            setImportModalOpen(false);
        } catch (error) {
            alert('Invalid JSON file. Please check the file format.');
            console.error("Import Error:", error);
        }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset everything to the default state? This cannot be undone.")) {
        localStorage.removeItem(THEMES_STORAGE_KEY);
        localStorage.removeItem(RULES_STORAGE_KEY);
        localStorage.removeItem(PREVIEW_HTML_STORAGE_KEY);
        window.location.reload();
    }
  };

  const handleUpdateHtml = (newHtml) => {
    setPreviewHtml(newHtml);
    setEditHtmlModalOpen(false);
  };

  const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textarea);
  };

  return (
    <>
        <div className="grid grid-rows-[1fr_auto] h-screen font-sans bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col h-screen md:flex-row overflow-hidden">
            <ControlsPanel
              themes={themes}
              rules={rules}
              activeTheme={activeTheme}
              setActiveTheme={setActiveTheme}
              onThemeUpdate={handleThemeUpdate}
              onAddThemeClick={() => setAddThemeModalOpen(true)}
              onAddRuleClick={() => setAddRuleModalOpen(true)}
              onImportClick={() => setImportModalOpen(true)}
              onResetClick={handleReset}
              onEditHtmlClick={() => setEditHtmlModalOpen(true)}
            />
            <PreviewPanel activeTheme={activeTheme} htmlContent={previewHtml} />
          </div>
          <div>
            <CssOutput css={generatedCss} onCopy={copyToClipboard} />
          </div>
        </div>

        <Modal isOpen={isAddThemeModalOpen} onClose={() => setAddThemeModalOpen(false)} title="Add New Theme">
            <form onSubmit={(e) => {
                e.preventDefault();
                handleAddTheme(e.target.elements.themeName.value);
            }}>
                <input
                    name="themeName"
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mb-4"
                    placeholder="New Theme Name"
                />
                <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">Add Theme</button>
            </form>
        </Modal>

        <Modal isOpen={isAddRuleModalOpen} onClose={() => setAddRuleModalOpen(false)} title="Add New Style Rule">
            <form onSubmit={(e) => {
                e.preventDefault();
                const partialRule = {
                    label: e.target.elements.label.value,
                    group: e.target.elements.group.value,
                    type: e.target.elements.type.value,
                };
                handleAddRule(partialRule);
            }}>
                <div className="space-y-4">
                    <input name="label" type="text" required className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Label (e.g., Button Font Size)" />
                    <input name="group" type="text" required className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Group (e.g., Typography)" />
                    <select name="type" className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <option value="text">Text</option>
                        <option value="color">Color</option>
                        <option value="dimension">Dimension</option>
                        <option value="duration">Duration</option>
                        <option value="angle">Angle</option>
                    </select>
                    <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">Add Rule</button>
                </div>
            </form>
        </Modal>

        <Modal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} title="Import Design Tokens">
            <form onSubmit={(e) => {
                e.preventDefault();
                handleImport(e.target.elements.importFile.files[0]);
            }}>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Select a JSON file with your design tokens to import them.</p>
                <input
                    name="importFile"
                    type="file"
                    accept=".json"
                    required
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
                />
                <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">Import Tokens</button>
            </form>
        </Modal>

        <Modal isOpen={isEditHtmlModalOpen} onClose={() => setEditHtmlModalOpen(false)} title="Edit Preview HTML" size="lg">
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateHtml(e.target.elements.htmlContent.value);
            }}>
                <textarea
                    name="htmlContent"
                    defaultValue={previewHtml}
                    className="w-full h-96 p-2 font-mono text-sm bg-gray-900 text-gray-100 border border-gray-700 rounded-lg"
                />
                <button type="submit" className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded-lg">Update Preview</button>
            </form>
        </Modal>
    </>
  );
}
