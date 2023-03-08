import { ExceptionFilter, HttpException, ArgumentsHost } from '@nestjs/common';
export declare class SpaFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): any;
}
