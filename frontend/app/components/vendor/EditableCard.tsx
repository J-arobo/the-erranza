'use client'
import { useState } from 'react'
import { Pencil, Check } from 'lucide-react'

export default function EditableCard({
    label, required, summary, children, defaultEditing = false,
}: {
    label: string
    required?: boolean
    summary?: React.ReactNode
    children: React.ReactNode
    defaultEditing?: boolean
}) {
    const [editing, setEditing] = useState(defaultEditing)
    const hasSummary = summary !== '' && summary !== null && summary !== undefined &&
        !(Array.isArray(summary) && summary.length === 0)

    return (
        <div className="bg-white border border-[#e0d9cc] rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-1.5">
                <label className="text-sm font-semibold text-[#1a1a1a]">
                    {label} {required && !hasSummary && <span className="text-orange-500 font-normal text-xs align-top">Required</span>}
                </label>
                {!editing && (
                    <button type="button" onClick={() => setEditing(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#2c4a1e] hover:underline flex-shrink-0">
                        <Pencil size={12} /> Edit
                    </button>
                )}
            </div>
            {editing ? (
                <>
                    {children}
                    <button type="button" onClick={() => setEditing(false)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#2c4a1e] hover:underline mt-3">
                        <Check size={12} /> Done
                    </button>
                </>
            ) : (
                <div className="text-sm text-gray-500">
                    {hasSummary ? summary : <span className="text-gray-300">Not set</span>}
                </div>
            )}
        </div>
    )
}
