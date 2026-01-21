import { HardcoverClient } from "@api/client"

let hardcoverClient: HardcoverClient | null = null

export const initializeHardcoverClient = (token: string) => {
  hardcoverClient = new HardcoverClient(token)
}

export const getHardcoverClient = () => hardcoverClient
