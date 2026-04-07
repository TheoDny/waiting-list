import * as React from "react"

import { Input } from "@/components/ui/input"
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"

function InputConceal({ ...props }: React.ComponentProps<"input">) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div className="relative">
            <Input
                type={isVisible ? "text" : "password"}
                {...props}
            />
            
            {isVisible ? 
                <HugeiconsIcon className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent hover:bg-transparent dark:hover:bg-transparent"
                    onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setIsVisible(!isVisible)
                    }} 
                    icon={ViewOffSlashIcon}/> 
            : 
                <HugeiconsIcon
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent hover:bg-transparent dark:hover:bg-transparent"
                    onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setIsVisible(!isVisible)
                    }}
                    icon={ViewIcon} />
            }
        </div>
    )
}

export { InputConceal }

