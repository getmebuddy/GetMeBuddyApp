// This file can be used for ambient module declarations or to solve
// issues like "Cannot find type definition file for 'some-module'".

// Suppress TS2688: Cannot find type definition file for 'navigation'.
// This might be needed if a dependency implicitly tries to reference types for 'navigation'
// and such a @types/navigation package doesn't exist or isn't relevant.
declare module 'navigation';
