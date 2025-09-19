import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

interface DropdownItem {
    label: string;
    onClick: () => void;
    isDivider?: false;
}

interface DividerItem {
    isDivider: true;
    label?: never;
    onClick?: never;
}

// fix: Export MenuItem type for external usage.
export type MenuItem = DropdownItem | DividerItem;

interface DropdownProps {
    buttonLabel: string;
    items: MenuItem[];
}

const Dropdown: React.FC<DropdownProps> = ({ buttonLabel, items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <Button variant="secondary" onClick={() => setIsOpen(!isOpen)}>
                    {buttonLabel}
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Button>
            </div>

            {isOpen && (
                 <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-component-background ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {items.map((item, index) => (
                            item.isDivider ? (
                                <div key={`divider-${index}`} className="border-t border-border-color my-1" />
                            ) : (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        item.onClick();
                                        setIsOpen(false);
                                    }}
                                    className="text-left w-full block px-4 py-2 text-sm text-basetext hover:bg-gray-100 dark:hover:bg-gray-800"
                                    role="menuitem"
                                >
                                    {item.label}
                                </button>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;