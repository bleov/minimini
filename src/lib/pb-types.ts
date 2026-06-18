/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	Archive: "archive",
	AverageRatings: "average_ratings",
	ConnectionsLeaderboard: "connections_leaderboard",
	ConnectionsState: "connections_state",
	CustomPuzzleData: "custom_puzzle_data",
	CustomPuzzles: "custom_puzzles",
	Leaderboard: "leaderboard",
	Notifications: "notifications",
	PuzzleState: "puzzle_state",
	PuzzleStats: "puzzle_stats",
	Ratings: "ratings",
	Shapes: "shapes",
	UserDailyStats: "user_daily_stats",
	UserMidiStats: "user_midi_stats",
	UserMiniStats: "user_mini_stats",
	Users: "users",
	WordleLeaderboard: "wordle_leaderboard",
	WordleState: "wordle_state",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type ArchiveRecord<Tconnections = unknown, Tdaily = unknown, Tmidi = unknown, Tmini = unknown, Twordle = unknown> = {
	connections?: null | Tconnections
	connections_id?: number
	created: IsoAutoDateString
	daily?: null | Tdaily
	daily_id?: number
	id: string
	media?: FileNameString[]
	midi?: null | Tmidi
	midi_id?: number
	mini?: null | Tmini
	mini_id?: number
	publication_date: string
	updated: IsoAutoDateString
	wordle?: null | Twordle
	wordle_id?: number
}

export type AverageRatingsRecord<Trating = unknown> = {
	count?: number
	id: string
	puzzle_id?: number
	rating?: null | Trating
}

export type ConnectionsLeaderboardRecord<Tguesses = unknown, Torder = unknown> = {
	created: IsoAutoDateString
	guesses?: null | Tguesses
	id: string
	mistakes?: number
	order?: null | Torder
	puzzle_date?: string
	puzzle_id?: number
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type ConnectionsStateRecord<Tstate = unknown> = {
	complete?: boolean
	created: IsoAutoDateString
	id: string
	puzzle_date?: string
	puzzle_id: number
	state?: null | Tstate
	updated: IsoAutoDateString
	user: RecordIdString
}

export const CustomPuzzleDataTypeOptions = {
	"mini": "mini",
	"midi": "midi",
	"daily": "daily",
	"connections": "connections",
	"wordle": "wordle",
} as const
export type CustomPuzzleDataTypeOptions = typeof CustomPuzzleDataTypeOptions[keyof typeof CustomPuzzleDataTypeOptions]
export type CustomPuzzleDataRecord<Tauthor_name = unknown, Tavg_rating = unknown, Tcompletions = unknown, Tpuzzle = unknown> = {
	author?: RecordIdString
	author_name?: null | Tauthor_name
	avg_rating?: null | Tavg_rating
	completions?: null | Tcompletions
	created: IsoAutoDateString
	id: string
	public?: boolean
	puzzle?: null | Tpuzzle
	title?: string
	type?: CustomPuzzleDataTypeOptions
	updated: IsoAutoDateString
}

export const CustomPuzzlesTypeOptions = {
	"mini": "mini",
	"midi": "midi",
	"daily": "daily",
	"connections": "connections",
	"wordle": "wordle",
} as const
export type CustomPuzzlesTypeOptions = typeof CustomPuzzlesTypeOptions[keyof typeof CustomPuzzlesTypeOptions]
export type CustomPuzzlesRecord<Tpuzzle = unknown> = {
	author?: RecordIdString
	created: IsoAutoDateString
	id: string
	public?: boolean
	puzzle?: null | Tpuzzle
	shape?: RecordIdString
	title?: string
	type?: CustomPuzzlesTypeOptions
	updated: IsoAutoDateString
}

export const LeaderboardPlatformOptions = {
	"mobile": "mobile",
	"desktop": "desktop",
} as const
export type LeaderboardPlatformOptions = typeof LeaderboardPlatformOptions[keyof typeof LeaderboardPlatformOptions]

export const LeaderboardTypeOptions = {
	"mini": "mini",
	"crossword": "crossword",
	"midi": "midi",
	"daily": "daily",
	"custom": "custom",
} as const
export type LeaderboardTypeOptions = typeof LeaderboardTypeOptions[keyof typeof LeaderboardTypeOptions]
export type LeaderboardRecord = {
	cheated?: boolean
	created: IsoAutoDateString
	hardcore?: boolean
	id: string
	platform?: LeaderboardPlatformOptions
	puzzle_id?: number
	time?: number
	type?: LeaderboardTypeOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type NotificationsRecord = {
	body?: string
	cleared?: RecordIdString[]
	created: IsoAutoDateString
	global?: boolean
	id: string
	recipients?: RecordIdString[]
	title: string
	updated: IsoAutoDateString
	viewed?: RecordIdString[]
}

export type PuzzleStateRecord<Tboard_state = unknown, Tselected = unknown> = {
	autocheck?: boolean
	board_state?: null | Tboard_state
	cheated?: boolean
	complete?: boolean
	created: IsoAutoDateString
	id: string
	puzzle_id?: number
	selected?: null | Tselected
	time?: number
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type PuzzleStatsRecord<Taverage_time = unknown, Thighest_time = unknown, Tlowest_time = unknown> = {
	average_time?: null | Taverage_time
	completions?: number
	highest_time?: null | Thighest_time
	id: string
	lowest_time?: null | Tlowest_time
}

export type RatingsRecord = {
	created: IsoAutoDateString
	id: string
	puzzle_id?: number
	rating: number
	updated: IsoAutoDateString
}

export const ShapesTypeOptions = {
	"mini": "mini",
	"midi": "midi",
	"daily": "daily",
} as const
export type ShapesTypeOptions = typeof ShapesTypeOptions[keyof typeof ShapesTypeOptions]
export type ShapesRecord<Tdata = unknown> = {
	created: IsoAutoDateString
	data?: null | Tdata
	id: string
	sort_order?: number
	type?: ShapesTypeOptions
	updated: IsoAutoDateString
}

export type UserDailyStatsRecord<Taverage_time = unknown, Thighest_time = unknown, Thighest_time_id = unknown, Tlowest_time = unknown, Tlowest_time_id = unknown, Tnum_cheated = unknown, Tnum_desktop = unknown> = {
	average_time?: null | Taverage_time
	highest_time?: null | Thighest_time
	highest_time_id?: null | Thighest_time_id
	id: string
	lowest_time?: null | Tlowest_time
	lowest_time_id?: null | Tlowest_time_id
	num_cheated?: null | Tnum_cheated
	num_completed?: number
	num_desktop?: null | Tnum_desktop
}

export type UserMidiStatsRecord<Taverage_time = unknown, Thighest_time = unknown, Thighest_time_id = unknown, Tlowest_time = unknown, Tlowest_time_id = unknown, Tnum_cheated = unknown, Tnum_desktop = unknown> = {
	average_time?: null | Taverage_time
	highest_time?: null | Thighest_time
	highest_time_id?: null | Thighest_time_id
	id: string
	lowest_time?: null | Tlowest_time
	lowest_time_id?: null | Tlowest_time_id
	num_cheated?: null | Tnum_cheated
	num_completed?: number
	num_desktop?: null | Tnum_desktop
}

export type UserMiniStatsRecord<Taverage_time = unknown, Thighest_time = unknown, Thighest_time_id = unknown, Tlowest_time = unknown, Tlowest_time_id = unknown, Tnum_cheated = unknown, Tnum_desktop = unknown> = {
	average_time?: null | Taverage_time
	highest_time?: null | Thighest_time
	highest_time_id?: null | Thighest_time_id
	id: string
	lowest_time?: null | Tlowest_time
	lowest_time_id?: null | Tlowest_time_id
	num_cheated?: null | Tnum_cheated
	num_completed?: number
	num_desktop?: null | Tnum_desktop
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email?: string
	emailVisibility?: boolean
	friend_code?: string
	friends?: RecordIdString[]
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	username: string
	verified?: boolean
}

export type WordleLeaderboardRecord<Tstate = unknown> = {
	created: IsoAutoDateString
	guesses: number
	id: string
	puzzle_date?: string
	puzzle_id: number
	state?: null | Tstate
	updated: IsoAutoDateString
	user: RecordIdString
}

export type WordleStateRecord<Tstate = unknown> = {
	complete?: boolean
	created: IsoAutoDateString
	id: string
	puzzle_date?: string
	puzzle_id: number
	state?: null | Tstate
	updated: IsoAutoDateString
	user: RecordIdString
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type ArchiveResponse<Tconnections = unknown, Tdaily = unknown, Tmidi = unknown, Tmini = unknown, Twordle = unknown, Texpand = unknown> = Required<ArchiveRecord<Tconnections, Tdaily, Tmidi, Tmini, Twordle>> & BaseSystemFields<Texpand>
export type AverageRatingsResponse<Trating = unknown, Texpand = unknown> = Required<AverageRatingsRecord<Trating>> & BaseSystemFields<Texpand>
export type ConnectionsLeaderboardResponse<Tguesses = unknown, Torder = unknown, Texpand = unknown> = Required<ConnectionsLeaderboardRecord<Tguesses, Torder>> & BaseSystemFields<Texpand>
export type ConnectionsStateResponse<Tstate = unknown, Texpand = unknown> = Required<ConnectionsStateRecord<Tstate>> & BaseSystemFields<Texpand>
export type CustomPuzzleDataResponse<Tauthor_name = unknown, Tavg_rating = unknown, Tcompletions = unknown, Tpuzzle = unknown, Texpand = unknown> = Required<CustomPuzzleDataRecord<Tauthor_name, Tavg_rating, Tcompletions, Tpuzzle>> & BaseSystemFields<Texpand>
export type CustomPuzzlesResponse<Tpuzzle = unknown, Texpand = unknown> = Required<CustomPuzzlesRecord<Tpuzzle>> & BaseSystemFields<Texpand>
export type LeaderboardResponse<Texpand = unknown> = Required<LeaderboardRecord> & BaseSystemFields<Texpand>
export type NotificationsResponse<Texpand = unknown> = Required<NotificationsRecord> & BaseSystemFields<Texpand>
export type PuzzleStateResponse<Tboard_state = unknown, Tselected = unknown, Texpand = unknown> = Required<PuzzleStateRecord<Tboard_state, Tselected>> & BaseSystemFields<Texpand>
export type PuzzleStatsResponse<Taverage_time = unknown, Thighest_time = unknown, Tlowest_time = unknown, Texpand = unknown> = Required<PuzzleStatsRecord<Taverage_time, Thighest_time, Tlowest_time>> & BaseSystemFields<Texpand>
export type RatingsResponse<Texpand = unknown> = Required<RatingsRecord> & BaseSystemFields<Texpand>
export type ShapesResponse<Tdata = unknown, Texpand = unknown> = Required<ShapesRecord<Tdata>> & BaseSystemFields<Texpand>
export type UserDailyStatsResponse<Taverage_time = unknown, Thighest_time = unknown, Thighest_time_id = unknown, Tlowest_time = unknown, Tlowest_time_id = unknown, Tnum_cheated = unknown, Tnum_desktop = unknown, Texpand = unknown> = Required<UserDailyStatsRecord<Taverage_time, Thighest_time, Thighest_time_id, Tlowest_time, Tlowest_time_id, Tnum_cheated, Tnum_desktop>> & BaseSystemFields<Texpand>
export type UserMidiStatsResponse<Taverage_time = unknown, Thighest_time = unknown, Thighest_time_id = unknown, Tlowest_time = unknown, Tlowest_time_id = unknown, Tnum_cheated = unknown, Tnum_desktop = unknown, Texpand = unknown> = Required<UserMidiStatsRecord<Taverage_time, Thighest_time, Thighest_time_id, Tlowest_time, Tlowest_time_id, Tnum_cheated, Tnum_desktop>> & BaseSystemFields<Texpand>
export type UserMiniStatsResponse<Taverage_time = unknown, Thighest_time = unknown, Thighest_time_id = unknown, Tlowest_time = unknown, Tlowest_time_id = unknown, Tnum_cheated = unknown, Tnum_desktop = unknown, Texpand = unknown> = Required<UserMiniStatsRecord<Taverage_time, Thighest_time, Thighest_time_id, Tlowest_time, Tlowest_time_id, Tnum_cheated, Tnum_desktop>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type WordleLeaderboardResponse<Tstate = unknown, Texpand = unknown> = Required<WordleLeaderboardRecord<Tstate>> & BaseSystemFields<Texpand>
export type WordleStateResponse<Tstate = unknown, Texpand = unknown> = Required<WordleStateRecord<Tstate>> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	archive: ArchiveRecord
	average_ratings: AverageRatingsRecord
	connections_leaderboard: ConnectionsLeaderboardRecord
	connections_state: ConnectionsStateRecord
	custom_puzzle_data: CustomPuzzleDataRecord
	custom_puzzles: CustomPuzzlesRecord
	leaderboard: LeaderboardRecord
	notifications: NotificationsRecord
	puzzle_state: PuzzleStateRecord
	puzzle_stats: PuzzleStatsRecord
	ratings: RatingsRecord
	shapes: ShapesRecord
	user_daily_stats: UserDailyStatsRecord
	user_midi_stats: UserMidiStatsRecord
	user_mini_stats: UserMiniStatsRecord
	users: UsersRecord
	wordle_leaderboard: WordleLeaderboardRecord
	wordle_state: WordleStateRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	archive: ArchiveResponse
	average_ratings: AverageRatingsResponse
	connections_leaderboard: ConnectionsLeaderboardResponse
	connections_state: ConnectionsStateResponse
	custom_puzzle_data: CustomPuzzleDataResponse
	custom_puzzles: CustomPuzzlesResponse
	leaderboard: LeaderboardResponse
	notifications: NotificationsResponse
	puzzle_state: PuzzleStateResponse
	puzzle_stats: PuzzleStatsResponse
	ratings: RatingsResponse
	shapes: ShapesResponse
	user_daily_stats: UserDailyStatsResponse
	user_midi_stats: UserMidiStatsResponse
	user_mini_stats: UserMiniStatsResponse
	users: UsersResponse
	wordle_leaderboard: WordleLeaderboardResponse
	wordle_state: WordleStateResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
