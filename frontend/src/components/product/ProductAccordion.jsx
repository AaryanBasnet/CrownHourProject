import { useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, Minus } from 'lucide-react';

/**
 * ProductAccordion Component
 * Expandable sections for specs, shipping, warranty
 */
export const ProductAccordion = ({ specifications }) => {
    const [openSections, setOpenSections] = useState(['specs']);

    const toggleSection = (section) => {
        setOpenSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const sections = [
        {
            id: 'specs',
            title: 'Technical Specifications',
            content: (
                <div className="text-[#6B6B6B] text-sm leading-relaxed space-y-2">
                    {specifications?.movement && (
                        <p><strong className="text-[#1A1A1A]">Movement:</strong> {specifications.movement}</p>
                    )}
                    {specifications?.powerReserve && (
                        <p><strong className="text-[#1A1A1A]">Power Reserve:</strong> {specifications.powerReserve}</p>
                    )}
                    {specifications?.caseDiameter && (
                        <p><strong className="text-[#1A1A1A]">Case Diameter:</strong> {specifications.caseDiameter}</p>
                    )}
                    {specifications?.caseMaterial && (
                        <p><strong className="text-[#1A1A1A]">Case Material:</strong> {specifications.caseMaterial}</p>
                    )}
                    {specifications?.waterResistance && (
                        <p><strong className="text-[#1A1A1A]">Water Resistance:</strong> {specifications.waterResistance}</p>
                    )}
                    {specifications?.glass && (
                        <p><strong className="text-[#1A1A1A]">Glass:</strong> {specifications.glass}</p>
                    )}
                    {specifications?.strapMaterial && (
                        <p><strong className="text-[#1A1A1A]">Strap:</strong> {specifications.strapMaterial}</p>
                    )}
                </div>
            ),
        },
        {
            id: 'shipping',
            title: 'Shipping & Returns',
            content: (
                <p className="text-[#6B6B6B] text-sm leading-relaxed">
                    We offer complimentary express shipping worldwide. All orders are insured.
                    Returns are accepted within 30 days of receipt, provided the watch is unworn
                    and in original condition.
                </p>
            ),
        },
        {
            id: 'warranty',
            title: '5-Year Warranty',
            content: (
                <p className="text-[#6B6B6B] text-sm leading-relaxed">
                    Every CrownHour timepiece is covered by our comprehensive 5-year international warranty.
                    This covers manufacturing defects and movement accuracy.
                </p>
            ),
        },
    ];

    return (
        <div className="border-t border-black/5">
            {sections.map((section) => (
                <div key={section.id} className="border-b border-black/5">
                    <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full py-5 flex items-center justify-between text-left hover:text-[#C9A962] transition-colors"
                    >
                        <span className="text-sm font-medium">{section.title}</span>
                        {openSections.includes(section.id) ? (
                            <Minus size={18} />
                        ) : (
                            <Plus size={18} />
                        )}
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-300 ${openSections.includes(section.id)
                                ? 'max-h-96 pb-5'
                                : 'max-h-0'
                            }`}
                    >
                        {section.content}
                    </div>
                </div>
            ))}
        </div>
    );
};

ProductAccordion.propTypes = {
    specifications: PropTypes.object,
};
